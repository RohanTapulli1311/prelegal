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
  return `# Cloud Service Agreement

## Cover Page

| Field | Value |
|:---|:---|
| **Effective Date** | ${formattedDate} |
| **Subscription Period** | ${data.subscriptionPeriod || '[Not specified]'} |
| **Fees** | ${data.fees || '[Not specified]'} |
| **Payment Process** | ${data.paymentProcess || '[Not specified]'} |
| **Governing Law** | ${data.governingLaw || '[Not specified]'} |
| **Jurisdiction** | ${data.jurisdiction || '[Not specified]'} |

---

*By signing this Cover Page, each party agrees to be bound by the terms of this Agreement.*

| | **Provider** | **Customer** |
|:---|:---|:---|
| **Print Name** | ${data.providerName || '_________________'} | ${data.customerName || '_________________'} |
| **Company** | ${data.providerCompany || '_________________'} | ${data.customerCompany || '_________________'} |
| **Notice Address** | ${data.providerNoticeAddress || '_________________'} | ${data.customerNoticeAddress || '_________________'} |
| **Date** | ${formattedDate} | ${formattedDate} |
| **Signature** | | |
`
}

const STANDARD_TERMS = stripSpans(`# Cloud Service Agreement

1. <span class="header_2" id="1">Service</span>
    1. <span class="header_3" id="1.1">Access and Use.</span>  During the <span class="orderform_link">Subscription Period</span> and subject to the terms of this Agreement, <span class="coverpage_link">Customer</span> may (a) access and use the Cloud Service; and (b) copy and use the included Software and Documentation only as needed to access and use the Cloud Service, in each case, for its internal business purposes. If a <span class="coverpage_link">Customer</span> Affiliate enters a separate Order Form with <span class="coverpage_link">Provider</span>, the <span class="coverpage_link">Customer's</span> Affiliate creates a separate agreement between <span class="coverpage_link">Provider</span> and that Affiliate, where <span class="coverpage_link">Provider's</span> responsibility to the Affiliate is individual and separate from <span class="coverpage_link">Customer</span> and <span class="coverpage_link">Customer</span> is not responsible for its Affiliates' agreement.
    2. <span class="header_3" id="1.2">Support.</span>  During the <span class="orderform_link">Subscription Period</span>, <span class="coverpage_link">Provider</span> will provide <span class="orderform_link">Technical Support</span> as described in the Order Form.
    3. <span class="header_3" id="1.3">User Accounts.</span>  <span class="coverpage_link">Customer</span> is responsible for all actions on Users' accounts and for all Users' compliance with this Agreement. <span class="coverpage_link">Customer</span> and Users must protect the confidentiality of their passwords and login credentials. <span class="coverpage_link">Customer</span> will promptly notify <span class="coverpage_link">Provider</span> if it suspects or knows of any fraudulent activity with its accounts, passwords, or credentials, or if they become compromised.
    4. <span class="header_3" id="1.4">Feedback and Usage Data.</span>  <span class="coverpage_link">Customer</span> may, but is not required to, give <span class="coverpage_link">Provider</span> Feedback, in which case <span class="coverpage_link">Customer</span> gives Feedback "AS IS". <span class="coverpage_link">Provider</span> may use all Feedback freely without any restriction or obligation. In addition, <span class="coverpage_link">Provider</span> may collect and analyze Usage Data, and <span class="coverpage_link">Provider</span> may freely use Usage Data to maintain, improve, enhance, and promote <span class="coverpage_link">Provider's</span> products and services without restriction or obligation. However, <span class="coverpage_link">Provider</span> may only disclose Usage Data to others if the Usage Data is aggregated and does not identify <span class="coverpage_link">Customer</span> or Users.
    5. <span class="header_3" id="1.5">Customer Content.</span>  <span class="coverpage_link">Provider</span> may copy, display, modify, and use Customer Content only as needed to provide and maintain the Product and related offerings. <span class="coverpage_link">Customer</span> is responsible for the accuracy and content of Customer Content.
    6. <span class="header_3" id="1.6">Machine Learning.</span>  Usage Data and Customer Content may be used to develop, train, or enhance artificial intelligence or machine learning models that are part of <span class="coverpage_link">Provider's</span> products and services, including third-party components of the Product, and <span class="coverpage_link">Customer</span> authorizes <span class="coverpage_link">Provider</span> to process its Usage Data and Customer Content for such purposes. However, (a) Usage Data and Customer Content must be aggregated before it can be used for these purposes, and (b) <span class="coverpage_link">Provider</span> will use commercially reasonable efforts consistent with industry standard technology to de-identify Usage Data and Customer Content before such use. Nothing in this section will reduce or limit <span class="coverpage_link">Provider's</span> obligations regarding Personal Data that may be contained in Usage Data or Customer Content under Applicable Data Protection Laws. Due to the nature of artificial intelligence and machine learning, information generated by these features may be incorrect or inaccurate. Product features that include artificial intelligence or machine learning models are not human and are not a substitute for human oversight.

2. <span class="header_2" id="2">Restrictions & Obligations</span>
    1. <span class="header_3" id="2.1">Restrictions on Customer.</span>
        a. Except as expressly permitted by this Agreement, <span class="coverpage_link">Customer</span> will not (and will not allow anyone else to): (i) reverse engineer, decompile, or attempt to discover any source code or underlying ideas or algorithms of the Product (except to the extent Applicable Laws prohibit this restriction); (ii) provide, sell, transfer, sublicense, lend, distribute, rent, or otherwise allow others to access or use the Product; (iii) remove any proprietary notices or labels; (iv) copy, modify, or create derivative works of the Product; (v) conduct security or vulnerability tests on, interfere with the operation of, cause performance degradation of, or circumvent access restrictions of the Product; (vi) access accounts, information, data, or portions of the Product to which <span class="coverpage_link">Customer</span> does not have explicit authorization; (vii) use the Product to develop a competing service or product; (viii) use the Product with any High Risk Activities or with any activity prohibited by Applicable Laws; (ix) use the Product to obtain unauthorized access to anyone else's networks or equipment; or (x) upload, submit, or otherwise make available to the Product any Customer Content to which <span class="coverpage_link">Customer</span> and Users do not have the proper rights.
        b. Use of the Product must comply with all Documentation and <span class="orderform_link">Use Limitations</span>.
    2. <span class="header_3" id="2.2">Suspension.</span>  If <span class="coverpage_link">Customer</span> (a) has an outstanding, undisputed balance on its account for more than 30 days; (b) breaches Section 2.1 (Restrictions on Customer); or (c) uses the Product in violation of the Agreement or in a way that materially and negatively impacts the Product or others, then <span class="coverpage_link">Provider</span> may temporarily suspend <span class="coverpage_link">Customer's</span> access to the Product with or without notice. However, <span class="coverpage_link">Provider</span> will try to inform <span class="coverpage_link">Customer</span> before suspending <span class="coverpage_link">Customer's</span> account when practical. <span class="coverpage_link">Provider</span> will reinstate <span class="coverpage_link">Customer's</span> access to the Product only if <span class="coverpage_link">Customer</span> resolves the underlying issue.

3. <span class="header_2" id="3">Privacy & Security</span>
    1. <span class="header_3" id="3.1">Personal Data.</span>  Before submitting Personal Data governed by GDPR, <span class="coverpage_link">Customer</span> must enter into a data processing agreement with <span class="coverpage_link">Provider</span>. If the parties have a <span class="keyterms_link">DPA</span>, each party will comply with its obligations in the <span class="keyterms_link">DPA</span>, the terms of the <span class="keyterms_link">DPA</span> will control each party's rights and obligations as to Personal Data, and the terms of the <span class="keyterms_link">DPA</span> will control in the event of any conflict with this Agreement.
    2. <span class="header_3" id="3.2">Prohibited Data.</span>  <span class="coverpage_link">Customer</span> will not (and will not allow anyone else to) submit Prohibited Data to the Product unless authorized by the Order Form or Key Terms.

4. <span class="header_2" id="4">Payment & Taxes</span>
    1. <span class="header_3" id="4.1">Fees.</span>  Unless the Order Form specifies a different currency, all Fees are in U.S. Dollars and are exclusive of taxes. Except for the prorated refund of prepaid Fees allowed with specific termination rights given in the Agreement, Fees are non-refundable.
    2. <span class="header_3" id="4.2">Invoicing.</span>  For a <span class="orderform_link">Payment Process</span> with invoicing, <span class="coverpage_link">Provider</span> will send invoices for usage-based Fees in arrears and for all other Fees in advance, in each case according to the <span class="orderform_link">Payment Process</span>.
    3. <span class="header_3" id="4.3">Automatic Payment.</span>  For a <span class="orderform_link">Payment Process</span> with automatic payment, <span class="coverpage_link">Provider</span> will automatically charge the credit card, debit card, or other payment method on file for Fees according to the <span class="orderform_link">Payment Process</span> and <span class="coverpage_link">Customer</span> authorizes all such charges.
    4. <span class="header_3" id="4.4">Taxes.</span>  <span class="coverpage_link">Customer</span> is responsible for all duties, taxes, and levies that apply to Fees, including sales, use, VAT, GST, or withholding, that <span class="coverpage_link">Provider</span> itemizes and includes in an invoice. However, <span class="coverpage_link">Customer</span> is not responsible for <span class="coverpage_link">Provider's</span> income taxes.
    5. <span class="header_3" id="4.5">Payment.</span>  <span class="coverpage_link">Customer</span> will pay <span class="coverpage_link">Provider</span> Fees and taxes in U.S. Dollars, unless the Order Form specifies a different currency, according to the <span class="orderform_link">Payment Process</span>.
    6. <span class="header_3" id="4.6">Payment Dispute.</span>  If <span class="coverpage_link">Customer</span> has a good-faith disagreement about the Fees charged or invoiced, <span class="coverpage_link">Customer</span> must notify <span class="coverpage_link">Provider</span> about the dispute before payment is due, or within 30 days of an automatic payment, and must pay all undisputed amounts on time. The parties will work together to resolve the dispute within 15 days.

5. <span class="header_2" id="5">Term & Termination</span>
    1. <span class="header_3" id="5.1">Order Form and Agreement.</span>  For each Order Form, the Agreement will start on the Order Date, continue through the Subscription Period, and automatically renew for additional Subscription Periods unless one party gives notice of non-renewal to the other party before the Non-Renewal Notice Date.
    2. <span class="header_3" id="5.2">Framework Terms.</span>  These Framework Terms will start on the Effective Date and continue for the longer of one year or until all Order Forms governed by the Framework Terms have ended.
    3. <span class="header_3" id="5.3">Termination.</span>  Either party may terminate the Framework Terms or an Order Form immediately: (a) if the other party fails to cure a material breach following 30 days notice; (b) upon notice if the other party materially breaches in a manner that cannot be cured, dissolves, makes an assignment for the benefit of creditors, or becomes the debtor in insolvency proceedings that continue for more than 60 days.
    4. <span class="header_3" id="5.4">Force Majeure.</span>  Either party may terminate an affected Order Form upon notice if a Force Majeure Event prevents the Product from materially operating for 30 or more consecutive days.
    5. <span class="header_3" id="5.5">Effect of Termination.</span>  Termination of the Framework Terms will automatically terminate all Order Forms. Upon any expiration or termination: Customer will no longer have any right to use the Product; Provider will delete Customer Content within 60 days upon request; each Recipient will return or destroy Discloser's Confidential Information; Provider will submit a final bill for all outstanding Fees.

6. <span class="header_2" id="6">Representations & Warranties</span>
    1. <span class="header_3" id="6.1">Mutual.</span>  Each party represents and warrants to the other that: (a) it has the legal power and authority to enter into this Agreement; (b) it is duly organized, validly existing, and in good standing; (c) it will comply with all Applicable Laws; and (d) it will comply with the Additional Warranties.
    2. <span class="header_3" id="6.2">From Customer.</span>  Customer represents and warrants that it, all Users, and anyone submitting Customer Content have all rights necessary to submit Customer Content to the Product.
    3. <span class="header_3" id="6.3">From Provider.</span>  Provider represents and warrants to Customer that it will not materially reduce the general functionality of the Cloud Service during the Subscription Period.

7. <span class="header_2" id="7">Disclaimer of Warranties</span>
    1. Provider makes no guarantees that the Product will always be safe, secure, or error-free, or that it will function without disruptions, delays, or imperfections. Except for the warranties in Section 6, Provider and Customer each **disclaim all other warranties and conditions, whether express or implied, including the implied warranties and conditions of merchantability, fitness for a particular purpose, title, and non-infringement.**

8. <span class="header_2" id="8">Limitation of Liability</span>
    1. <span class="header_3" id="8.1">Liability Caps.</span>  **Each party's total cumulative liability for all claims arising out of or relating to this Agreement will not be more than the General Cap Amount.**
    2. <span class="header_3" id="8.2">Damages Waiver.</span>  **Under no circumstances will either party be liable to the other for lost profits or revenues, or for consequential, special, indirect, exemplary, punitive, or incidental damages relating to this Agreement.**

9. <span class="header_2" id="9">Indemnification</span>
    1. Provider will indemnify, defend, and hold harmless Customer from and against all Provider Covered Claims and associated damages, costs, and expenses. Customer will indemnify, defend, and hold harmless Provider from and against all Customer Covered Claims and associated damages, costs, and expenses.

10. <span class="header_2" id="10">Confidentiality</span>
    1. Recipient will not use or disclose Discloser's Confidential Information except as authorized in the Agreement or as needed to fulfill its obligations. Recipient will protect Confidential Information using at least the same protections it uses for its own similar information but no less than a reasonable standard of care.

11. <span class="header_2" id="11">Reservation of Rights</span>
    1. Provider retains all right, title, and interest in and to the Product. Customer retains all right, title, and interest in and to the Customer Content.

12. <span class="header_2" id="12">General Terms</span>
    1. This Agreement is the only agreement between the parties about its subject and supersedes all prior statements. The Governing Law will govern all interpretations and disputes. The parties will bring any legal proceedings in the Chosen Courts. Neither party may assign this Agreement without prior written consent, except in connection with a merger or sale of substantially all assets. This Agreement may be signed in counterparts, including electronic copies.`)

export const csaConfig: DocumentConfig = {
  slug: 'csa',
  name: 'Cloud Service Agreement',
  description: 'A standard agreement for cloud-based SaaS products covering subscription terms, data handling, and service commitments.',
  filename: 'CSA.md',
  defaultData: {
    providerName: '',
    providerCompany: '',
    providerNoticeAddress: '',
    customerName: '',
    customerCompany: '',
    customerNoticeAddress: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    subscriptionPeriod: '',
    fees: '',
    paymentProcess: '',
    governingLaw: '',
    jurisdiction: '',
  },
  buildPreviewMarkdown: (data) => buildCoverPage(data) + '\n\n---\n\n' + STANDARD_TERMS,
}
