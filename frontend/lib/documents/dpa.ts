import type { DocumentConfig } from './index'

function stripSpans(text: string): string {
  return text.replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '')
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '[Effective Date]'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function buildCoverPage(data: Record<string, string>): string {
  return `# Data Processing Agreement

## Cover Page

| Field | Value |
|:---|:---|
| **Effective Date** | ${formatDate(data.effectiveDate)} |
| **Governing Member State** | ${data.governingMemberState || '[Not specified]'} |
| **Categories of Personal Data** | ${data.dataCategories || '[Not specified]'} |
| **Categories of Data Subjects** | ${data.dataSubjectCategories || '[Not specified]'} |
| **Nature and Purpose of Processing** | ${data.processingPurpose || '[Not specified]'} |
| **Duration of Processing** | ${data.processingDuration || '[Not specified]'} |
| **Approved Subprocessors** | ${data.approvedSubprocessors || '[Not specified]'} |

---

*By signing below, the parties agree to this Data Processing Agreement.*

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

const STANDARD_TERMS = stripSpans(`# Data Processing Agreement — Standard Terms

1. Processor and Subprocessor Relationships

    1. Provider as Processor. In situations where Customer is a Controller of the Customer Personal Data, Provider will be deemed a Processor that is Processing Personal Data on behalf of Customer.

    2. Provider as Subprocessor. In situations where Customer is a Processor of the Customer Personal Data, Provider will be deemed a Subprocessor of the Customer Personal Data.

2. Processing

    1. Processing Details. Annex I(B) on the Cover Page describes the subject matter, nature, purpose, and duration of this Processing, as well as the Categories of Personal Data collected and Categories of Data Subjects.

    2. Processing Instructions. Customer instructs Provider to Process Customer Personal Data: (a) to provide and maintain the Service; (b) as may be further specified through Customer's use of the Service; (c) as documented in the Agreement; and (d) as documented in any other written instructions given by Customer and acknowledged by Provider about Processing Customer Personal Data under this DPA.

    3. Processing by Provider. Provider will only Process Customer Personal Data in accordance with this DPA, including the details in the Cover Page.

    4. Subprocessors. Provider will not provide, transfer, or hand over any Customer Personal Data to a Subprocessor unless Customer has approved the Subprocessor. Provider will inform Customer at least 10 business days in advance of any intended changes to the Approved Subprocessors.

3. Restricted Transfers

    1. Authorization. Customer agrees that Provider may transfer Customer Personal Data outside the EEA, the United Kingdom, or other relevant geographic territory as necessary to provide the Service.

    2. Ex-EEA Transfers. If the GDPR protects the transfer of Customer Personal Data from Customer within the EEA to Provider outside of the EEA, the parties are deemed to have signed the EEA SCCs and their Annexes, which are incorporated by reference.

4. Security Incident Response

    1. Upon becoming aware of any Security Incident, Provider will: (a) notify Customer without undue delay when feasible, but no later than 72 hours after becoming aware of the Security Incident; (b) provide timely information about the Security Incident; and (c) promptly take reasonable steps to contain and investigate the Security Incident.

5. Audit & Reports

    1. Audit Rights. Provider will give Customer all information reasonably necessary to demonstrate its compliance with this DPA and will allow for and contribute to audits by Customer.

6. Coordination & Cooperation

    1. Response to Inquiries. If Provider receives any inquiry or request about the Processing of Customer Personal Data, Provider will notify Customer about the request and will not respond without Customer's prior consent.

7. Deletion of Customer Personal Data

    1. Deletion at DPA Expiration. After the DPA expires, Provider will return or delete Customer Personal Data at Customer's instruction unless further storage is required by Applicable Law.

8. Limitation of Liability

    1. To the maximum extent permitted under Applicable Data Protection Laws, each party's total cumulative liability arising out of or related to this DPA will be subject to the waivers, exclusions, and limitations of liability stated in the Agreement.

*Common Paper Data Processing Agreement free to use under CC BY 4.0.*
`)

export function buildDpaPreviewMarkdown(data: Record<string, string>): string {
  return buildCoverPage(data) + '\n\n---\n\n' + STANDARD_TERMS
}

export const dpaConfig: DocumentConfig = {
  slug: 'dpa',
  name: 'Data Processing Agreement',
  description: 'A GDPR-compliant data processing agreement governing how a service provider processes personal data on behalf of a controller.',
  filename: 'DPA.md',
  defaultData: {
    effectiveDate: new Date().toISOString().split('T')[0],
    party1Name: '', party1Title: '', party1Company: '', party1NoticeAddress: '',
    party2Name: '', party2Title: '', party2Company: '', party2NoticeAddress: '',
    dataCategories: '',
    dataSubjectCategories: '',
    processingPurpose: '',
    processingDuration: '',
    approvedSubprocessors: '',
    governingMemberState: '',
  },
  buildPreviewMarkdown: buildDpaPreviewMarkdown,
}
