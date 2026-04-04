"""
Grants + Nonprofit Data Pipeline
Pulls grant opportunities from Grants.gov and nonprofit 990 data from
ProPublica's Nonprofit Explorer API, writing results to JSON files.

Usage:
    python data.py
    python data.py --keywords "education" "health" --state NY --grant-limit 100
    python data.py --nonprofit-queries "food bank" "housing" --grant-limit 50
"""

import argparse
import json
import time
import sys
import requests

GRANTS_SEARCH_URL = "https://api.grants.gov/v1/api/search2"
GRANTS_DETAIL_URL = "https://api.grants.gov/v1/api/fetchOpportunity"
PROPUBLICA_SEARCH_URL = "https://projects.propublica.org/nonprofits/api/v2/search.json"
PROPUBLICA_ORG_URL = "https://projects.propublica.org/nonprofits/api/v2/organizations/{ein}.json"

HEADERS = {"Content-Type": "application/json"}
REQUEST_DELAY = 0.5  # seconds between detail calls


# ---------------------------------------------------------------------------
# Grants.gov
# ---------------------------------------------------------------------------

def fetch_grants(keyword="", agency="", status="posted", rows=25, max_pages=4):
    """Search grants.gov and return a list of basic opportunity dicts."""
    results = []
    seen_ids = set()

    for page in range(max_pages):
        payload = {
            "keyword": keyword,
            "agencies": agency,
            "oppStatuses": status,
            "rows": rows,
            "startRecord": page * rows,
        }
        try:
            resp = requests.post(GRANTS_SEARCH_URL, json=payload, headers=HEADERS, timeout=15)
            resp.raise_for_status()
            data = resp.json().get("data", {})
        except Exception as e:
            print(f"  [warn] grants search page {page} failed: {e}")
            break

        hits = data.get("oppHits", [])
        if not hits:
            break

        for hit in hits:
            opp_id = hit.get("id")
            if opp_id and opp_id not in seen_ids:
                seen_ids.add(opp_id)
                results.append(hit)

        hit_count = data.get("hitCount", 0)
        fetched_so_far = (page + 1) * rows
        print(f"  grants page {page + 1}: {len(hits)} results (total available: {hit_count})")

        if fetched_so_far >= hit_count:
            break

    return results


def fetch_grant_detail(opportunity_id):
    """Fetch full detail for a single grant opportunity."""
    try:
        resp = requests.post(
            GRANTS_DETAIL_URL,
            json={"opportunityId": opportunity_id},
            headers=HEADERS,
            timeout=15,
        )
        resp.raise_for_status()
        return resp.json().get("data", {})
    except Exception as e:
        print(f"  [warn] detail fetch failed for opportunity {opportunity_id}: {e}")
        return {}


def normalize_grant(basic, detail):
    """Merge basic search result + detail into a clean flat dict."""
    synopsis = detail.get("synopsis", {})
    alns = detail.get("alns") or basic.get("alns") or []

    return {
        "id": basic.get("id"),
        "opportunity_number": basic.get("opportunityNumber") or detail.get("opportunityNumber"),
        "title": basic.get("opportunityTitle") or detail.get("opportunityTitle"),
        "agency_code": basic.get("agencyCode") or detail.get("owningAgencyCode"),
        "agency_name": basic.get("agencyName") or detail.get("owningAgencyName"),
        "status": basic.get("oppStatus"),
        "posted_date": synopsis.get("postingDate") or basic.get("postedDate"),
        "closing_date": synopsis.get("closingDate") or basic.get("closingDate"),
        "award_floor": synopsis.get("awardFloor"),
        "award_ceiling": synopsis.get("awardCeiling"),
        "cost_sharing": synopsis.get("costSharing"),
        "applicant_types": synopsis.get("applicantTypes", []),
        "funding_instruments": synopsis.get("fundingInstruments", []),
        "funding_categories": synopsis.get("fundingActivityCategories", []),
        "aln_codes": [a.get("aln") for a in alns if a.get("aln")],
        "description": synopsis.get("synopsisDesc") or synopsis.get("description"),
        "source": "grants.gov",
    }


# ---------------------------------------------------------------------------
# ProPublica / IRS 990
# ---------------------------------------------------------------------------

def search_nonprofits(query="", state="", ntee_code="", max_pages=4):
    """Search ProPublica for nonprofits and return a list of basic org dicts."""
    results = []
    seen_eins = set()

    for page in range(max_pages):
        params = {"q": query, "page": page}
        if state:
            params["state[id]"] = state.upper()
        if ntee_code:
            params["ntee[id]"] = ntee_code

        try:
            resp = requests.get(PROPUBLICA_SEARCH_URL, params=params, timeout=15)
            resp.raise_for_status()
            data = resp.json()
        except Exception as e:
            print(f"  [warn] nonprofit search page {page} failed: {e}")
            break

        orgs = data.get("organizations", [])
        if not orgs:
            break

        for org in orgs:
            ein = org.get("ein")
            if ein and ein not in seen_eins:
                seen_eins.add(ein)
                results.append(org)

        num_pages = data.get("num_pages", 1)
        print(f"  nonprofits page {page + 1}/{num_pages}: {len(orgs)} results")

        if page >= num_pages - 1:
            break

    return results


def fetch_nonprofit_detail(ein):
    """Fetch full org detail + 990 filing history for a single EIN."""
    try:
        url = PROPUBLICA_ORG_URL.format(ein=ein)
        resp = requests.get(url, timeout=15)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"  [warn] org detail fetch failed for EIN {ein}: {e}")
        return {}


def normalize_nonprofit(basic, detail):
    """Merge basic search result + detail into a clean flat dict."""
    org = detail.get("organization", {})
    filings = detail.get("filings_with_data", [])

    # Most recent filing with financial data
    latest = filings[0] if filings else {}

    filing_history = [
        {
            "year": f.get("tax_prd_yr"),
            "form_type": f.get("formtype"),
            "total_revenue": f.get("totrevenue"),
            "total_expenses": f.get("totfuncexpns"),
            "total_assets": f.get("totassetsend"),
            "total_liabilities": f.get("totliabend"),
            "pdf_url": f.get("pdf_url"),
        }
        for f in filings
    ]

    return {
        "ein": basic.get("ein") or org.get("ein"),
        "name": org.get("name") or basic.get("name"),
        "address": org.get("address"),
        "city": org.get("city") or basic.get("city"),
        "state": org.get("state") or basic.get("state"),
        "zip": org.get("zip"),
        "website": org.get("url") or basic.get("url"),
        "ntee_code": org.get("ntee_code") or basic.get("ntee_code"),
        "subsection_code": basic.get("c_code"),
        "latest_filing_year": latest.get("tax_prd_yr"),
        "total_revenue": latest.get("totrevenue"),
        "total_expenses": latest.get("totfuncexpns"),
        "total_assets": latest.get("totassetsend"),
        "total_liabilities": latest.get("totliabend"),
        "filing_history": filing_history,
        "source": "propublica/irs-990",
    }


# ---------------------------------------------------------------------------
# Dataset builders
# ---------------------------------------------------------------------------

def build_grants_dataset(keywords, agencies, status, grant_limit, rows_per_page=25):
    """Fetch grants for all keyword/agency combos, deduplicate, enrich with detail."""
    all_basic = []
    seen_ids = set()
    max_pages = max(1, grant_limit // rows_per_page)

    for keyword in keywords:
        for agency in (agencies or [""]):
            print(f"\nSearching grants: keyword='{keyword}' agency='{agency}'")
            hits = fetch_grants(
                keyword=keyword,
                agency=agency,
                status=status,
                rows=rows_per_page,
                max_pages=max_pages,
            )
            for hit in hits:
                opp_id = hit.get("id")
                if opp_id and opp_id not in seen_ids:
                    seen_ids.add(opp_id)
                    all_basic.append(hit)
                    if len(all_basic) >= grant_limit:
                        break
            if len(all_basic) >= grant_limit:
                break

    print(f"\nFetching detail for {len(all_basic)} grant opportunities...")
    grants = []
    for i, basic in enumerate(all_basic, 1):
        opp_id = basic.get("id")
        detail = fetch_grant_detail(opp_id) if opp_id else {}
        grants.append(normalize_grant(basic, detail))
        if i % 10 == 0:
            print(f"  {i}/{len(all_basic)} grant details fetched")
        time.sleep(REQUEST_DELAY)

    return grants


def build_nonprofits_dataset(queries, states, nonprofit_limit, max_pages=4):
    """Fetch nonprofits for all query/state combos, deduplicate, enrich with 990 detail."""
    all_basic = []
    seen_eins = set()

    for query in queries:
        for state in (states or [""]):
            print(f"\nSearching nonprofits: query='{query}' state='{state}'")
            orgs = search_nonprofits(
                query=query,
                state=state,
                max_pages=max_pages,
            )
            for org in orgs:
                ein = org.get("ein")
                if ein and ein not in seen_eins:
                    seen_eins.add(ein)
                    all_basic.append(org)
                    if len(all_basic) >= nonprofit_limit:
                        break
            if len(all_basic) >= nonprofit_limit:
                break

    print(f"\nFetching 990 detail for {len(all_basic)} nonprofits...")
    nonprofits = []
    for i, basic in enumerate(all_basic, 1):
        ein = basic.get("ein")
        detail = fetch_nonprofit_detail(ein) if ein else {}
        nonprofits.append(normalize_nonprofit(basic, detail))
        if i % 10 == 0:
            print(f"  {i}/{len(all_basic)} nonprofit details fetched")
        time.sleep(REQUEST_DELAY)

    return nonprofits


# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------

def write_json(data, path):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, default=str)
    print(f"  Wrote {len(data)} records -> {path}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Scrape grants.gov and IRS 990 data into JSON")
    parser.add_argument(
        "--keywords", nargs="+", default=["nonprofit", "community", "health", "education"],
        help="Grant keyword search terms (default: nonprofit community health education)"
    )
    parser.add_argument(
        "--agencies", nargs="+", default=[],
        help="Filter grants by agency code(s), e.g. HHS DOE (default: all agencies)"
    )
    parser.add_argument(
        "--grant-status", default="posted",
        choices=["posted", "forecasted", "closed", "archived"],
        help="Grant opportunity status to filter on (default: posted)"
    )
    parser.add_argument(
        "--grant-limit", type=int, default=50,
        help="Max number of grant records to collect (default: 50)"
    )
    parser.add_argument(
        "--nonprofit-queries", nargs="+", default=["foundation", "charity", "community fund"],
        help="Nonprofit search terms (default: foundation charity 'community fund')"
    )
    parser.add_argument(
        "--state", nargs="+", default=[],
        help="Filter nonprofits by state abbreviation(s), e.g. NY CA TX"
    )
    parser.add_argument(
        "--nonprofit-limit", type=int, default=50,
        help="Max number of nonprofit records to collect (default: 50)"
    )
    parser.add_argument(
        "--output-dir", default=".",
        help="Directory to write output JSON files (default: current directory)"
    )
    parser.add_argument(
        "--skip-grants", action="store_true", help="Skip grants.gov collection"
    )
    parser.add_argument(
        "--skip-nonprofits", action="store_true", help="Skip nonprofit/990 collection"
    )
    args = parser.parse_args()

    import os
    out = args.output_dir.rstrip("/")
    os.makedirs(out, exist_ok=True)

    grants = []
    nonprofits = []

    # --- Grants ---
    if not args.skip_grants:
        print("\n=== Collecting Grants (grants.gov) ===")
        grants = build_grants_dataset(
            keywords=args.keywords,
            agencies=args.agencies,
            status=args.grant_status,
            grant_limit=args.grant_limit,
        )
        print(f"\nGrants collected: {len(grants)}")
        write_json(grants, f"{out}/grants.json")

    # --- Nonprofits / IRS 990 ---
    if not args.skip_nonprofits:
        print("\n=== Collecting Nonprofits (ProPublica / IRS 990) ===")
        nonprofits = build_nonprofits_dataset(
            queries=args.nonprofit_queries,
            states=args.state,
            nonprofit_limit=args.nonprofit_limit,
        )
        print(f"\nNonprofits collected: {len(nonprofits)}")
        write_json(nonprofits, f"{out}/nonprofits.json")

    # --- Combined ---
    if grants or nonprofits:
        combined = {"grants": grants, "nonprofits": nonprofits}
        with open(f"{out}/combined.json", "w", encoding="utf-8") as f:
            json.dump(combined, f, indent=2, default=str)
        print(f"  Wrote combined.json ({len(grants)} grants, {len(nonprofits)} nonprofits)")

    print("\nDone.")


if __name__ == "__main__":
    main()
