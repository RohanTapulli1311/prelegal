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
  return `# Software License Agreement

## Cover Page

| Field | Value |
|:---|:---|
| **Effective Date** | ${formatDate(data.effectiveDate)} |
| **Subscription Period** | ${data.subscriptionPeriod || '[Not specified]'} |
| **Permitted Uses** | ${data.permittedUses || '[Not specified]'} |
| **License Limits** | ${data.licenseLimits || '[Not specified]'} |
| **Fees** | ${data.fees || '[Not specified]'} |
| **Payment Process** | ${data.paymentProcess || '[Not specified]'} |
| **Governing Law** | ${data.governingLaw || '[Not specified]'} |
| **Jurisdiction** | ${data.jurisdiction || '[Not specified]'} |
| **General Cap Amount** | ${data.generalCapAmount || '[Not specified]'} |

---

*By signing below, the parties agree to this Software License Agreement.*

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

const STANDARD_TERMS = stripSpans(`# Software License Agreement — Standard Terms

1. Software

    1. License. During the Subscription Period and subject to the terms of this Agreement, Provider grants Customer a limited, non-exclusive, non-sublicensable, non-transferable license to install and use the Software on systems owned or controlled by Customer for the Permitted Uses.

    2. Feedback and Usage Data. Customer may give Provider Feedback. Provider may use all Feedback freely. Provider may collect and analyze Usage Data to maintain, improve, enhance, and promote its products and services.

    3. Updates. During the Subscription Period, Provider will provide to Customer, at no additional charge, Updates that Provider makes generally available to its customers.

    4. Reservation of Rights. Provider retains all right, title, and interest in and to the Product.

2. Restrictions & Obligations

    1. Restrictions on Customer. Customer will not: (i) reverse engineer or decompile the Product; (ii) sublicense or distribute the Product; (iii) use the Product to develop a competing service; or (iv) exceed the License Limits.

3. Payment & Taxes

    1. Fees are in U.S. Dollars and are non-refundable except as expressly provided. Customer will pay Provider Fees according to the Payment Process.

4. Term & Termination

    1. The Agreement will start on the Effective Date, continue through the Subscription Period, and automatically renew unless a party gives notice of non-renewal before the Non-Renewal Notice Date.

    2. Either party may terminate immediately if the other party materially breaches and fails to cure within 30 days of notice.

5. Representations & Warranties

    1. Each party represents that it has the legal power and authority to enter into this Agreement and will comply with all Applicable Laws.

    2. Provider warrants that, during the Warranty Period, the Software will substantially conform to the Documentation.

6. Disclaimer of Warranties

    1. Except for the warranties in Section 5, Provider and Customer each disclaim all other warranties and conditions, whether express or implied.

7. Limitation of Liability

    1. Each party's total cumulative liability for all claims will not exceed the General Cap Amount. Under no circumstances will either party be liable for consequential, special, indirect, or punitive damages.

8. Indemnification

    1. Each party will indemnify, defend, and hold harmless the other from covered claims as specified on the Cover Page.

9. Confidentiality

    1. Each party will protect the other's Confidential Information and not disclose it to third parties without prior written approval.

10. General Terms

    1. This Agreement is the entire agreement between the parties about its subject. Governing Law and Chosen Courts as specified on the Cover Page. The Agreement may only be amended in writing signed by both parties.

*Common Paper Software License Agreement free to use under CC BY 4.0.*
`)

export function buildSoftwareLicensePreviewMarkdown(data: Record<string, string>): string {
  return buildCoverPage(data) + '\n\n---\n\n' + STANDARD_TERMS
}

export const softwareLicenseConfig: DocumentConfig = {
  slug: 'software-license',
  name: 'Software License Agreement',
  description: 'A standard agreement for licensing software, covering grant of rights, restrictions, and support terms.',
  filename: 'Software-License-Agreement.md',
  defaultData: {
    effectiveDate: new Date().toISOString().split('T')[0],
    party1Name: '', party1Title: '', party1Company: '', party1NoticeAddress: '',
    party2Name: '', party2Title: '', party2Company: '', party2NoticeAddress: '',
    subscriptionPeriod: '',
    permittedUses: '',
    licenseLimits: '',
    fees: '',
    paymentProcess: '',
    governingLaw: '',
    jurisdiction: '',
    generalCapAmount: '',
  },
  buildPreviewMarkdown: buildSoftwareLicensePreviewMarkdown,
}
