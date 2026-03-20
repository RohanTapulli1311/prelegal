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
  return `# Partnership Agreement

## Cover Page

| Field | Value |
|:---|:---|
| **Effective Date** | ${formatDate(data.effectiveDate)} |
| **End Date** | ${data.endDate ? formatDate(data.endDate) : '[Not specified]'} |
| **Obligations** | ${data.obligations || '[Not specified]'} |
| **Territory** | ${data.territory || '[Not specified]'} |
| **Payment Process** | ${data.paymentProcess || '[Not specified]'} |
| **Governing Law** | ${data.governingLaw || '[Not specified]'} |
| **Jurisdiction** | ${data.jurisdiction || '[Not specified]'} |
| **General Cap Amount** | ${data.generalCapAmount || '[Not specified]'} |

---

*By signing below, the parties agree to this Partnership Agreement.*

| | **COMPANY** | **PARTNER** |
|:---|:---|:---|
| **Print Name** | ${data.party1Name || '_________________'} | ${data.party2Name || '_________________'} |
| **Title** | ${data.party1Title || '_________________'} | ${data.party2Title || '_________________'} |
| **Company** | ${data.party1Company || '_________________'} | ${data.party2Company || '_________________'} |
| **Notice Address** | ${data.party1NoticeAddress || '_________________'} | ${data.party2NoticeAddress || '_________________'} |
| **Date** | ${formatDate(data.effectiveDate)} | ${formatDate(data.effectiveDate)} |
| **Signature** | | |
`
}

const STANDARD_TERMS = stripSpans(`# Partnership Agreement — Standard Terms

1. Cooperation

    1. Obligations. Each party will perform its Obligations as detailed in the Cover Page.

    2. Feedback. Each party may, but is not required to, give Feedback to the other party. All Feedback is given "AS IS".

2. Payment & Taxes

    1. If the Obligations include payment of Fees from one party to the other, the following terms apply: Fees are in U.S. Dollars unless the Cover Page specifies otherwise, and are non-refundable except for prorated prepaid fees.

3. Trademark License

    1. Trademark License. Licensor grants to Licensee during the term a non-exclusive, non-transferrable, revocable, royalty-free license to use the Licensor's Brand Elements solely as necessary to perform its Obligations.

4. Privacy

    1. If the parties have a DPA, each party will comply with its obligations in the DPA.

5. Escalation Procedure

    1. Each party agrees to give the other party written notice of specific issues in dispute prior to seeking legal relief. Within 30 days after receipt of notice, at least one representative from each party will hold a meeting to attempt to resolve the dispute in good faith.

6. Term & Termination

    1. Term. This Agreement starts on the Effective Date and continues until the End Date, unless earlier terminated.

    2. Termination. Either party may terminate the Agreement immediately: (a) if the other party fails to cure a material breach upon 30 days notice; or (b) upon notice if the other party dissolves, stops conducting business, or becomes insolvent.

7. Representations & Warranties

    1. Each party represents and warrants that: (a) it has the legal power and authority to enter into this Agreement; (b) it is duly organized and in good standing; and (c) it will comply with all Applicable Laws.

8. Disclaimer of Warranties

    1. Except for the warranties in Section 7, Company and Partner each disclaim all other warranties, whether express or implied.

9. Limitation of Liability

    1. Each party's total cumulative liability for all claims will not exceed the General Cap Amount. Under no circumstances will either party be liable for consequential, special, indirect, or punitive damages.

10. Indemnification

    1. Each party will indemnify, defend, and hold harmless the other from claims arising from its own breach or negligence.

11. Confidentiality

    1. Each party will protect the other's Confidential Information using at least the same protections it uses for its own similar information but no less than a reasonable standard of care.

12. General Terms

    1. This Agreement is the only agreement between the parties about its subject. Any modification must be in writing and signed by both parties. Governing Law and Chosen Courts as specified on the Cover Page.

*Common Paper Partnership Agreement free to use under CC BY 4.0.*
`)

export function buildPartnershipPreviewMarkdown(data: Record<string, string>): string {
  return buildCoverPage(data) + '\n\n---\n\n' + STANDARD_TERMS
}

export const partnershipConfig: DocumentConfig = {
  slug: 'partnership',
  name: 'Partnership Agreement',
  description: 'A standard partnership agreement covering reseller, referral, and technology integration arrangements between companies.',
  filename: 'Partnership-Agreement.md',
  defaultData: {
    effectiveDate: new Date().toISOString().split('T')[0],
    endDate: '',
    party1Name: '', party1Title: '', party1Company: '', party1NoticeAddress: '',
    party2Name: '', party2Title: '', party2Company: '', party2NoticeAddress: '',
    obligations: '',
    territory: '',
    paymentProcess: '',
    governingLaw: '',
    jurisdiction: '',
    generalCapAmount: '',
  },
  buildPreviewMarkdown: buildPartnershipPreviewMarkdown,
}
