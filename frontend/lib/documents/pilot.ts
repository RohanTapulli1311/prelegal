import type { DocumentConfig } from './index'

function stripSpans(text: string): string {
  return text.replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '')
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '[Not specified]'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function buildCoverPage(data: Record<string, string>): string {
  return `# Pilot Agreement

## Cover Page

| Field | Value |
|:---|:---|
| **Effective Date** | ${formatDate(data.effectiveDate)} |
| **Pilot Period** | ${data.pilotPeriod || '[Not specified]'} |
| **Governing Law** | ${data.governingLaw || '[Not specified]'} |
| **Jurisdiction** | ${data.jurisdiction || '[Not specified]'} |
| **General Cap Amount** | ${data.generalCapAmount || '[Not specified]'} |

---

*By signing below, the parties agree to this Pilot Agreement.*

| | **PROVIDER** | **CUSTOMER** |
|:---|:---|:---|
| **Print Name** | ${data.party1Name || '_________________'} | ${data.party2Name || '_________________'} |
| **Title** | ${data.party1Title || '_________________'} | ${data.party2Title || '_________________'} |
| **Company** | ${data.party1Company || '_________________'} | ${data.party2Company || '_________________'} |
| **Notice Address** | ${data.party1NoticeAddress || '_________________'} | ${data.party2NoticeAddress || '_________________'} |
| **Date** | ${formatDate(data.effectiveDate)} | ${formatDate(data.effectiveDate)} |
| **Signature** | | |
`
}

const STANDARD_TERMS = stripSpans(`# Pilot Agreement — Standard Terms

1. Pilot Access

    1. Access and Use. During the Pilot Period and subject to the terms of this Agreement, Customer may access and use the Product solely for Customer's Evaluation Purposes.

    2. License. If the Product contains Software, Provider grants Customer a limited, non-exclusive, non-sublicensable, non-transferable license to install and use such Software solely for Customer's Evaluation Purposes.

    3. Feedback and Usage Data. Customer may give Provider Feedback. Provider may use all Feedback and Usage Data freely without any restriction or obligation.

    4. Restrictions. Customer will not: (i) reverse engineer or decompile the Product; (ii) sublicense, sell, or distribute the Product; (iii) use the Product to develop a competing service; or (iv) use the Product with any activity prohibited by Applicable Laws.

    5. Reservation of Rights. Provider retains all right, title, and interest in and to the Product.

2. Term & Termination

    1. Agreement. The Agreement will start on the Effective Date and continue through the Pilot Period.

    2. Termination. Either party may terminate the Agreement immediately: (a) if the other party fails to cure a material breach following 30 days notice; or (b) for any or no reason following 30 days notice.

    3. Effect of Termination. Upon expiration or termination, Customer will no longer have any right to use the Product. If the Product contains Software, Customer will uninstall or delete all such Software.

3. Representations

    1. Each party represents that it has the legal power and authority to enter into this Agreement and is duly organized and in good standing.

4. Disclaimer of Warranties

    1. The Product is provided on an "AS IS" and "AS AVAILABLE" basis. Provider disclaims all warranties and conditions, whether express or implied, including merchantability, fitness for a particular purpose, title, and non-infringement.

5. Limitation of Liability

    1. Each party's total cumulative liability for all claims will not exceed the General Cap Amount.

    2. Except for a breach of Section 6 (Confidentiality), under no circumstances will either party be liable for consequential, special, indirect, exemplary, punitive, or incidental damages.

6. Confidentiality

    1. Each party will protect the other's Confidential Information using at least the same protections it uses for its own similar information but no less than a reasonable standard of care.

7. General Terms

    1. This Agreement is the entire agreement about its subject. Governing Law and Chosen Courts as specified on the Cover Page. The Agreement may only be amended in writing signed by both parties.

*Common Paper Pilot Agreement free to use under CC BY 4.0.*
`)

export function buildPilotPreviewMarkdown(data: Record<string, string>): string {
  return buildCoverPage(data) + '\n\n---\n\n' + STANDARD_TERMS
}

export const pilotConfig: DocumentConfig = {
  slug: 'pilot',
  name: 'Pilot Agreement',
  description: 'A short-term pilot or proof-of-concept agreement allowing customers to evaluate software before committing to a full contract.',
  filename: 'Pilot-Agreement.md',
  defaultData: {
    effectiveDate: new Date().toISOString().split('T')[0],
    party1Name: '', party1Title: '', party1Company: '', party1NoticeAddress: '',
    party2Name: '', party2Title: '', party2Company: '', party2NoticeAddress: '',
    pilotPeriod: '',
    governingLaw: '',
    jurisdiction: '',
    generalCapAmount: '',
  },
  buildPreviewMarkdown: buildPilotPreviewMarkdown,
}
