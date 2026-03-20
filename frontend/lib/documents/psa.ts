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
  return `# Professional Services Agreement

## Cover Page

| Field | Value |
|:---|:---|
| **Effective Date** | ${formattedDate} |
| **Deliverables** | ${data.deliverables || '[Not specified]'} |
| **Fees** | ${data.fees || '[Not specified]'} |
| **Payment Period** | ${data.paymentPeriod || '[Not specified]'} |
| **General Cap Amount** | ${data.generalCapAmount || '[Not specified]'} |
| **Governing Law** | ${data.governingLaw || '[Not specified]'} |
| **Jurisdiction** | ${data.jurisdiction || '[Not specified]'} |

---

*By signing this Cover Page, each party agrees to be bound by the terms of this Agreement.*

| | **Provider** | **Customer** |
|:---|:---|:---|
| **Print Name** | ${data.providerName || '_________________'} | ${data.customerName || '_________________'} |
| **Title** | ${data.providerTitle || '_________________'} | ${data.customerTitle || '_________________'} |
| **Company** | ${data.providerCompany || '_________________'} | ${data.customerCompany || '_________________'} |
| **Notice Address** | ${data.providerNoticeAddress || '_________________'} | ${data.customerNoticeAddress || '_________________'} |
| **Date** | ${formattedDate} | ${formattedDate} |
| **Signature** | | |
`
}

const STANDARD_TERMS = stripSpans(`## Standard Terms

1. <span class="header_2">Services</span>
    1. <span class="header_3">Providing Services.</span>  <span class="keyterms_link">Customer</span> or its Affiliates may enter SOWs with <span class="keyterms_link">Provider</span>. <span class="keyterms_link">Provider</span> will perform the Services as detailed in an applicable SOW. Each SOW together with the Key Terms and Standard Terms will constitute a separate agreement.
    2. <span class="header_3">Cooperation.</span>  <span class="keyterms_link">Customer</span> will reasonably cooperate with <span class="keyterms_link">Provider</span> to allow the performance of Services. <span class="keyterms_link">Provider</span> is not responsible for an inability to perform the Services caused by <span class="keyterms_link">Customer's</span> failure to cooperate as reasonably requested.
    3. <span class="header_3">Change Orders.</span>  <span class="keyterms_link">Provider</span> or <span class="keyterms_link">Customer</span> may amend any SOW by entering a Change Order. A Change Order will not be binding until <span class="keyterms_link">Provider</span> and <span class="keyterms_link">Customer</span> agree in writing on the Change Order.
    4. <span class="header_3">Acceptance.</span>  If according to the SOW Deliverables are subject to this section, <span class="keyterms_link">Customer</span> will be deemed to have approved a Deliverable if <span class="keyterms_link">Customer</span> does not reject the Deliverable within the Rejection Period.
    5. <span class="header_3">Subcontractors.</span>  <span class="keyterms_link">Provider</span> may use Subcontractors to perform the Services only with <span class="keyterms_link">Customer's</span> prior permission. However, <span class="keyterms_link">Provider</span> may use its Affiliates to perform Services without <span class="keyterms_link">Customer's</span> prior permission.

2. <span class="header_2">Intellectual Property</span>
    1. <span class="header_3">Deliverables.</span>  Except for Pre-Existing Materials and Third-Party Materials, <span class="keyterms_link">Provider</span> assigns all right, title, and interest in the Deliverables (if any) to <span class="keyterms_link">Customer</span> at the Time of Assignment.
    2. <span class="header_3">Customer Materials.</span>  <span class="keyterms_link">Provider</span> may copy, display, modify, and use Customer Materials only as needed to provide the Services.
    3. <span class="header_3">Pre-Existing Materials.</span>  To the extent <span class="keyterms_link">Provider</span> incorporates Pre-Existing Materials into Deliverables, <span class="keyterms_link">Provider</span> grants <span class="keyterms_link">Customer</span> a non-exclusive, non-transferrable, perpetual, irrevocable, worldwide license to use Pre-Existing Materials only as necessary to use the Deliverables according to this Agreement.
    4. <span class="header_3">Feedback and Usage Data.</span>  <span class="keyterms_link">Customer</span> may, but is not required to, give <span class="keyterms_link">Provider</span> Feedback, in which case <span class="keyterms_link">Customer</span> gives Feedback "AS IS". <span class="keyterms_link">Provider</span> may use all Feedback freely without any restriction or obligation.

3. <span class="header_2">Privacy & Security</span>
    1. If the parties have a DPA, each party will comply with its obligations in the DPA, the terms of the DPA will control each party's rights and obligations as to Personal Data, and the terms of the DPA will control in the event of any conflict with this Agreement.

4. <span class="header_2">Payment & Taxes</span>
    1. <span class="header_3">Fees and Invoices.</span>  Unless the currency is specified in the SOW, all Fees are in U.S. Dollars and are exclusive of taxes. Except for the prorated refund of prepaid Fees allowed with specific termination rights, Fees are non-refundable. Provider will send invoices for Fees as described in the SOW.
    2. <span class="header_3">Payment.</span>  <span class="keyterms_link">Customer</span> will pay <span class="keyterms_link">Provider</span> the Fees and taxes in each invoice in U.S. Dollars within the Payment Period.
    3. <span class="header_3">Taxes.</span>  <span class="keyterms_link">Customer</span> is responsible for all duties, taxes, and levies that apply to Fees, including sales, use, VAT, GST, or withholding. However, <span class="keyterms_link">Customer</span> is not responsible for <span class="keyterms_link">Provider's</span> income taxes.

5. <span class="header_2">Term & Termination</span>
    1. <span class="header_3">Term.</span>  This Agreement will start on the Effective Date and continue until 12 months have elapsed since the end of the latest SOW Term end date.
    2. <span class="header_3">Termination.</span>  Either party may terminate this Agreement or an SOW immediately if the other party (i) fails to cure a material breach within 30 days after receiving notice; (ii) materially breaches in a manner that cannot be cured; (iii) dissolves or stops conducting business without a successor; (iv) makes an assignment for the benefit of creditors; or (v) becomes the debtor in insolvency, receivership, or bankruptcy proceedings that continue for more than 60 days.
    3. <span class="header_3">Effect of Termination.</span>  Upon any expiration or termination: termination of the Agreement will automatically terminate all SOWs; Provider will no longer have to provide the Services; each Recipient will return or destroy Discloser's Confidential Information.

6. <span class="header_2">Representations & Warranties</span>
    1. <span class="header_3">Mutual.</span>  Each party represents and warrants to the other that it has the legal power and authority to enter into this Agreement, is duly organized and validly existing, and will comply with all Applicable Laws.
    2. <span class="header_3">From Provider.</span>  Provider represents and warrants to Customer that: (a) it will perform the Services in a timely, competent, and professional manner; (b) the Deliverables do not and will not infringe or misappropriate anyone else's intellectual property rights; (c) the Deliverables will conform to the requirements in the SOW.

7. <span class="header_2">Disclaimer of Warranties</span>
    1. Except for the warranties in Section 6, Provider and Customer each **disclaim all other warranties, whether express or implied, including the implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement.**

8. <span class="header_2">Limitation of Liability</span>
    1. <span class="header_3">Liability Caps.</span>  **If there are Increased Claims, each party's total cumulative liability for the Increased Claims arising out of or relating to this Agreement will not be more than the Increased Cap Amount. Each party's total cumulative liability for all other claims arising out of or relating to this Agreement will not be more than the General Cap Amount.**
    2. <span class="header_3">Damages Waiver.</span>  **Under no circumstances will either party be liable to the other for lost profits or revenues, or for consequential, special, indirect, exemplary, punitive, or incidental damages relating to this Agreement.**

9. <span class="header_2">Indemnification</span>
    1. Provider will indemnify, defend, and hold harmless Customer from and against all Provider Covered Claims and associated damages, costs, and expenses. Customer will indemnify, defend, and hold harmless Provider from and against all Customer Covered Claims and associated damages, costs, and expenses.

10. <span class="header_2">Insurance</span>
    1. During the term of the Agreement and for six months after, each party will carry commercial insurance policies with coverage limits that meet the relevant Insurance Minimums required in the SOW, if any.

11. <span class="header_2">Confidentiality</span>
    1. Recipient will only use Discloser's Confidential Information to fulfill its obligations or exercise its rights under this Agreement and will not disclose Discloser's Confidential Information to anyone else. Recipient will protect Confidential Information using at least the same protections it uses for its own similar information.

12. <span class="header_2">General Terms</span>
    1. This Agreement is the only agreement between the parties about its subject and supersedes all prior statements. The Governing Law will govern all interpretations and disputes. The parties will bring any legal proceedings in the Chosen Courts. Neither party may assign any rights or obligations under this Agreement without prior written consent, except Customer may assign this Agreement upon notice in connection with a merger or sale of substantially all assets. This Agreement may be signed in counterparts, including by electronic copies or acceptance mechanism.`)

export const psaConfig: DocumentConfig = {
  slug: 'psa',
  name: 'Professional Services Agreement',
  description: 'A standard agreement for professional services engagements including consulting, implementation, and custom development work.',
  filename: 'psa.md',
  defaultData: {
    providerName: '',
    providerTitle: '',
    providerCompany: '',
    providerNoticeAddress: '',
    customerName: '',
    customerTitle: '',
    customerCompany: '',
    customerNoticeAddress: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    governingLaw: '',
    jurisdiction: '',
    deliverables: '',
    fees: '',
    paymentPeriod: '',
    generalCapAmount: '',
  },
  buildPreviewMarkdown: (data) => buildCoverPage(data) + '\n\n---\n\n' + STANDARD_TERMS,
}
