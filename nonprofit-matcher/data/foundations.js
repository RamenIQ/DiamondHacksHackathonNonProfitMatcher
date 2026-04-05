import { readFileSync } from 'fs';
import { join } from 'path';

const raw = JSON.parse(
  readFileSync(join(process.cwd(), '../data/grants-1.json'), 'utf-8')
);

function formatGrantRange(floor, ceiling) {
  const f = parseInt(floor) || 0;
  const c = parseInt(ceiling) || 0;
  if (f === 0 && c === 0) return 'Amount not specified';
  if (f === 0 && c > 0) return `Up to $${c.toLocaleString()}`;
  if (f > 0 && c === 0) return `$${f.toLocaleString()}+`;
  return `$${f.toLocaleString()} – $${c.toLocaleString()}`;
}

function cleanHtml(str) {
  return (str || '')
    .replace(/<[^>]+>/g, ' ')   // strip HTML tags
    .replace(/&ndash;/g, '–')
    .replace(/&amp;/g, '&')
    .replace(/&mdash;/g, '—')
    .replace(/&nbsp;/g, ' ')
    .replace(/\r\n/g, ' ')
    .replace(/\s{2,}/g, ' ')    // collapse whitespace
    .trim();
}

export const foundations = raw.map((grant) => {
  const focusAreas = (grant.funding_categories || [])
    .map((fc) => fc.description)
    .filter((d) => !d.toLowerCase().includes('see text field'));

  const eligibility = (grant.applicant_types || [])
    .map((at) => at.description)
    .filter(
      (d) =>
        !d.toLowerCase().includes('see text field') &&
        !d.toLowerCase().startsWith('unrestricted')
    );

  return {
    name: cleanHtml(grant.title),
    agency: grant.agency_code,
    opportunity_number: grant.opportunity_number,
    focus_areas: focusAreas.length ? focusAreas : ['General / Other'],
    geographic_focus: ['United States'],
    typical_grant_range: formatGrantRange(grant.award_floor, grant.award_ceiling),
    eligibility: eligibility.length ? eligibility : ['See grant description for eligibility'],
    description: cleanHtml(grant.description).slice(0, 500),
    website: `https://www.grants.gov/search-results-detail/${grant.id}`,
    status: grant.status,
    posted_date: grant.posted_date,
    closing_date: grant.closing_date,
  };
});
