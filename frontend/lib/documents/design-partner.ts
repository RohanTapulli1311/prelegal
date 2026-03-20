import type { DocumentConfig } from './index'

function stripSpans(text: string): string {
  return text.replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '')
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '[Effective Date]'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function buildCoverPage(data: Record<string, string>): string {
  const formattedDate = formatDate(data.effectiveDate)
  return `# Design Partner Agreement

## Cover Page

| Field | Value |
|:---|:---|
| **Effective Date** | ${formattedDate} |
| **Term** | ${data.term || '[Not specified]'} |
| **Program Description** | ${data.programDescription || '[Not specified]'} |
| **Fees** | ${data.fees || 'None'} |
| **Governing Law** | ${data.governingLaw || '[Not specified]'} |
| **Jurisdiction** | ${data.jurisdiction || '[Not specified]'} |

---

*By signing this Cover Page, each party agrees to be bound by the terms of this Agreement.*

| | **Provider** | **Partner** |
|:---|:---|:---|
| **Print Name** | ${data.providerName || '_________________'} | ${data.partnerName || '_________________'} |
| **Title** | ${data.providerTitle || '_________________'} | ${data.partnerTitle || '_________________'} |
| **Company** | ${data.providerCompany || '_________________'} | ${data.partnerCompany || '_________________'} |
| **Notice Address** | ${data.providerNoticeAddress || '_________________'} | ${data.partnerNoticeAddress || '_________________'} |
| **Date** | ${formattedDate} | ${formattedDate} |
| **Signature** | | |
`
}

const STANDARD_TERMS = stripSpans(`## Standard Terms

1. <span class="header_2">Design Partner Overview</span>
    1. <span class="header_3">Product Access.</span>  <span class="keyterms_link">Partner</span> would like to be one of the first users of the Product. During the <span class="keyterms_link">Term</span>, <span class="keyterms_link">Partner</span> will have early access to the Product for its internal business purposes and to give Feedback to <span class="keyterms_link">Provider</span> and participate in the <span class="keyterms_link">Program</span>, so long as <span class="keyterms_link">Partner</span> complies with the terms of this Agreement.
    2. <span class="header_3">Program and Feedback.</span>  The purpose of the <span class="keyterms_link">Program</span> is for <span class="keyterms_link">Provider</span> to develop, build, and improve the Product for general use by all of <span class="keyterms_link">Provider's</span> customers or users. <span class="keyterms_link">Partner</span> will give Feedback to <span class="keyterms_link">Provider</span> on a mutually agreed schedule and will participate in the <span class="keyterms_link">Program</span>.
    3. <span class="header_3">Product Improvement.</span>  <span class="keyterms_link">Provider</span> will develop and improve the Product and may use all Feedback and insight about the Product from the <span class="keyterms_link">Program</span> freely without any restriction or obligation. <span class="keyterms_link">Partner</span> will not give any Feedback that <span class="keyterms_link">Provider</span> cannot use in this manner or for the purpose.
2. <span class="header_2">Fees and Costs</span>
    1. <span class="keyterms_link">Partner</span> will pay <span class="keyterms_link">Provider</span> the <span class="keyterms_link">Fees</span>, if any.
3. <span class="header_2">Term & Termination</span>
    1. <span class="header_3">Agreement Term.</span>  This Agreement will start on the <span class="keyterms_link">Effective Date</span> and continue for the <span class="keyterms_link">Term</span>. <span class="keyterms_link">Provider</span> and <span class="keyterms_link">Partner</span> may mutually agree to extend the <span class="keyterms_link">Term</span>, including by email communication.
    2. <span class="header_3">Termination.</span>  Either party may terminate this Agreement for any or no reason. To terminate this Agreement, the terminating party must notify the other party about termination by giving the other party 30 days advance notice.
    3. <span class="header_3">Effect of Termination.</span>  Upon expiration or termination of the Agreement: <span class="keyterms_link">Partner</span> will no longer have any right to access or use the Product; each Recipient will return or destroy Discloser's Confidential Information in its possession or control.
4. <span class="header_2">Disclaimer of Warranties</span>
    1. <span class="keyterms_link">Provider</span> and <span class="keyterms_link">Partner</span> each disclaim all warranties, whether express or implied, including the implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement. These disclaimers apply to the maximum extent permitted by Applicable Laws.
5. <span class="header_2">Confidentiality</span>
    1. <span class="header_3">Non-Use and Non-Disclosure.</span>  Unless otherwise authorized in the Agreement, Recipient will (a) only use Discloser's Confidential Information to fulfill its obligations or exercise its rights under this Agreement; and (b) not disclose Discloser's Confidential Information to anyone else. Recipient will protect Discloser's Confidential Information using at least the same protections Recipient uses for its own similar information but no less than a reasonable standard of care.
    2. <span class="header_3">Exclusions.</span>  Confidential Information does not include information that (a) Recipient knew without any obligation of confidentiality before disclosure by Discloser; (b) is or becomes publicly known and generally available through no fault of Recipient; (c) Recipient receives under no obligation of confidentiality from someone else who is authorized to make the disclosure; or (d) Recipient independently developed without use of or reference to Discloser's Confidential Information.
6. <span class="header_2">Intellectual Property</span>
    1. <span class="header_3">Reservation of Rights.</span>  Except for the limited license to access the Product in Section 1.1, <span class="keyterms_link">Provider</span> retains all right, title, and interest in and to the Product, including any aspects, features, or functionality created in response to Feedback or <span class="keyterms_link">Partner's</span> participation in the <span class="keyterms_link">Program</span>.
    2. <span class="header_3">Ownership.</span> <span class="keyterms_link">Provider</span> owns all Feedback. <span class="keyterms_link">Partner</span> hereby assigns to <span class="keyterms_link">Provider</span> all its right, title, and interest in and to Feedback.
7. <span class="header_2">General Terms</span>
    1. This Agreement is the only agreement between the parties about its subject. Any waiver, modification, or change to the Agreement must be in writing and signed or electronically accepted by each party. The Governing Law will govern all interpretations and disputes. The parties will bring any legal proceedings in the Chosen Courts. Neither party may assign any rights or obligations under this Agreement without the prior written consent of the other party, except in connection with a merger or sale of substantially all assets. This Agreement may be signed in counterparts, including by electronic copies or acceptance mechanism.
8. <span class="header_2">Definitions</span>
    1. **"Agreement"** means these Standard Terms, the Cover Page between Provider and Partner, and the policies and documents referenced in or attached to the Cover Page.
    2. **"Applicable Laws"** means the laws, rules, regulations, court orders, and other binding requirements of a relevant government authority that apply to or govern Provider or Partner.
    3. **"Confidential Information"** means information in any form disclosed by or on behalf of a Discloser to a Recipient in connection with this Agreement that (a) the Discloser identifies as "confidential", "proprietary", or the like; or (b) should be reasonably understood as confidential or proprietary due to its nature and the circumstances of its disclosure.
    4. **"Feedback"** means suggestions, feedback, or comments about the Product or related offerings.
    5. **"Product"** means the product or services described in the Cover Page.`)

export const designPartnerConfig: DocumentConfig = {
  slug: 'design-partner',
  name: 'Design Partner Agreement',
  description: 'An agreement for early-stage design partnerships, covering product feedback, IP rights, and limited access to pre-release software.',
  filename: 'design-partner-agreement.md',
  defaultData: {
    providerName: '',
    providerTitle: '',
    providerCompany: '',
    providerNoticeAddress: '',
    partnerName: '',
    partnerTitle: '',
    partnerCompany: '',
    partnerNoticeAddress: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    term: '',
    programDescription: '',
    fees: '',
    governingLaw: '',
    jurisdiction: '',
  },
  buildPreviewMarkdown: (data) => buildCoverPage(data) + '\n\n---\n\n' + STANDARD_TERMS,
}
