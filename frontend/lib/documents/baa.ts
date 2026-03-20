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
  return `# Business Associate Agreement

## Cover Page

| Field | Value |
|:---|:---|
| **BAA Effective Date** | ${formatDate(data.effectiveDate)} |
| **Parent Agreement** | ${data.parentAgreement || '[Not specified]'} |
| **Breach Notification Period** | ${data.breachNotificationPeriod || '72 hours'} |
| **Limitations** | ${data.limitations || '[None — standard permissions apply]'} |

---

*By signing below, the parties agree to this Business Associate Agreement.*

| | **PROVIDER** (Business Associate) | **COMPANY** (Covered Entity) |
|:---|:---|:---|
| **Print Name** | ${data.party1Name || '_________________'} | ${data.party2Name || '_________________'} |
| **Title** | ${data.party1Title || '_________________'} | ${data.party2Title || '_________________'} |
| **Company** | ${data.party1Company || '_________________'} | ${data.party2Company || '_________________'} |
| **Notice Address** | ${data.party1NoticeAddress || '_________________'} | ${data.party2NoticeAddress || '_________________'} |
| **Date** | ${formatDate(data.effectiveDate)} | ${formatDate(data.effectiveDate)} |
| **Signature** | | |
`
}

const STANDARD_TERMS = stripSpans(`# Business Associate Agreement — Standard Terms

1. Business Associate Obligations

    1. Obligations and Restrictions. Provider may not use or disclose PHI other than as described in this BAA, as permitted under the Privacy Rule, or as otherwise required by applicable law.

    2. Permitted Uses and Disclosures. Except as otherwise permitted or required in this BAA, Provider may only use or disclose PHI as reasonably necessary to provide the Services or as otherwise required by applicable law.

    3. Privacy and Information Security Program. Provider will maintain a privacy and information security program that takes steps to ensure that employees or agents of Provider comply with this BAA.

    4. Safeguards. Provider will implement appropriate administrative, physical, and technical safeguards to protect the confidentiality, integrity, and availability of PHI.

    5. Subcontractors. Except as restricted by applicable Limitations, Provider may disclose PHI to a Subcontractor and allow the Subcontractor to create, receive, maintain, or transmit PHI on its behalf, provided that Provider first ensures that each Subcontractor executes a binding, written agreement requiring the Subcontractor to protect PHI under terms substantially similar to this BAA.

2. Company Obligations

    1. Notice of Privacy Practices. Upon request, Company will provide Provider with its current notice of privacy practices.

    2. Notice of Changes. Company will notify Provider in a timely manner of any changes to how Company uses or discloses PHI to the extent that the changes impact how Provider uses or discloses PHI under the BAA.

3. Data Rights & Restrictions

    1. Offshoring PHI. Except as restricted by applicable Limitations, Provider is permitted to use and disclose PHI outside of the United States to provide the Services.

    2. De-Identification. Except as restricted by applicable Limitations, Provider may de-identify PHI.

    3. Aggregation. Except as restricted by applicable Limitations, Provider may aggregate PHI for its own purposes.

4. Breach Notification

    1. Breach Reporting. Provider will report to Company within the Breach Notification Period each use or disclosure of PHI not permitted under this BAA of which Provider becomes aware.

5. Term & Termination

    1. Term. This BAA will start on the BAA Effective Date and will continue in effect until the later of when all obligations of the parties have been met or when the Agreement ends or expires.

    2. Termination. Either party may terminate this BAA if the other party fails to cure a material breach within 30 days after receiving notice.

    3. Effect of Termination. Upon any expiration or termination, Provider will either return or destroy all PHI maintained by Provider, its agents, or its Subcontractors.

*Common Paper Business Associate Agreement Version 1.0 free to use under CC BY 4.0.*
`)

export function buildBaaPreviewMarkdown(data: Record<string, string>): string {
  return buildCoverPage(data) + '\n\n---\n\n' + STANDARD_TERMS
}

export const baaConfig: DocumentConfig = {
  slug: 'baa',
  name: 'Business Associate Agreement',
  description: 'A HIPAA-compliant business associate agreement governing the handling of protected health information (PHI) by a service provider.',
  filename: 'BAA.md',
  defaultData: {
    effectiveDate: new Date().toISOString().split('T')[0],
    party1Name: '', party1Title: '', party1Company: '', party1NoticeAddress: '',
    party2Name: '', party2Title: '', party2Company: '', party2NoticeAddress: '',
    breachNotificationPeriod: '72 hours',
    limitations: '',
    parentAgreement: '',
  },
  buildPreviewMarkdown: buildBaaPreviewMarkdown,
}
