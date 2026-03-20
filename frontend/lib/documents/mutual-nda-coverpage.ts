import type { DocumentConfig } from './index'

function formatDate(dateStr: string): string {
  if (!dateStr) return '[Effective Date]'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function buildCoverPageOnly(data: Record<string, string>): string {
  const formattedDate = formatDate(data.effectiveDate)

  const mndaTerm =
    data.mndaTermType === 'expires'
      ? `Expires ${data.mndaTermYears || '1'} year(s) from Effective Date.`
      : 'Continues until terminated in accordance with the terms of the MNDA.'

  const confidentialityTerm =
    data.confidentialityTermType === 'years'
      ? `${data.confidentialityTermYears || '1'} year(s) from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.`
      : 'In perpetuity.'

  return `# Mutual Non-Disclosure Agreement — Cover Page

This Cover Page forms part of the Common Paper Mutual NDA Standard Terms Version 1.0.

## Cover Page

### Purpose
*How Confidential Information may be used*

${data.purpose || '[Purpose not specified]'}

### Effective Date

${formattedDate}

### MNDA Term
*The length of this MNDA*

${mndaTerm}

### Term of Confidentiality
*How long Confidential Information is protected*

${confidentialityTerm}

### Governing Law & Jurisdiction

**Governing Law:** ${data.governingLaw || '[State not specified]'}

**Jurisdiction:** ${data.jurisdiction || '[Jurisdiction not specified]'}

${data.modifications ? `### MNDA Modifications\n\n${data.modifications}\n\n` : ''}
---

*By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.*

| | **PARTY 1** | **PARTY 2** |
|:---|:---|:---|
| **Print Name** | ${data.party1Name || '_________________'} | ${data.party2Name || '_________________'} |
| **Title** | ${data.party1Title || '_________________'} | ${data.party2Title || '_________________'} |
| **Company** | ${data.party1Company || '_________________'} | ${data.party2Company || '_________________'} |
| **Notice Address** | ${data.party1NoticeAddress || '_________________'} | ${data.party2NoticeAddress || '_________________'} |
| **Date** | ${formattedDate} | ${formattedDate} |
| **Signature** | | |

---

*Common Paper Mutual Non-Disclosure Agreement (Version 1.0) free to use under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).*
`
}

const defaultData: Record<string, string> = {
  purpose: 'Evaluating whether to enter into a business relationship with the other party.',
  effectiveDate: new Date().toISOString().split('T')[0],
  mndaTermType: 'expires',
  mndaTermYears: '1',
  confidentialityTermType: 'years',
  confidentialityTermYears: '1',
  governingLaw: '',
  jurisdiction: '',
  modifications: '',
  party1Name: '',
  party1Title: '',
  party1Company: '',
  party1NoticeAddress: '',
  party2Name: '',
  party2Title: '',
  party2Company: '',
  party2NoticeAddress: '',
}

export const mutualNdaCoverpageConfig: DocumentConfig = {
  slug: 'mutual-nda-coverpage',
  name: 'Mutual NDA Cover Page',
  description: 'Cover page and deal terms summary for the Common Paper Mutual NDA.',
  filename: 'Mutual-NDA-coverpage.md',
  defaultData,
  buildPreviewMarkdown: (data) => buildCoverPageOnly(data),
}
