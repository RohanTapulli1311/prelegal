import type { DocumentConfig } from './index'

function stripSpans(text: string): string {
  return text.replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '')
}

function buildCoverPage(data: Record<string, string>): string {
  return `# Service Level Agreement

## Cover Page

| Field | Value |
|:---|:---|
| **Provider** | ${data.providerName || '[Not specified]'}${data.providerCompany ? `, ${data.providerCompany}` : ''} |
| **Customer** | ${data.customerName || '[Not specified]'}${data.customerCompany ? `, ${data.customerCompany}` : ''} |
| **Subscription Period** | ${data.subscriptionPeriod || '[Not specified]'} |
| **Target Uptime** | ${data.targetUptime || '[Not specified]'} |
| **Target Response Time** | ${data.targetResponseTime || '[Not specified]'} |
| **Support Channel** | ${data.supportChannel || '[Not specified]'} |
| **Uptime Credit** | ${data.uptimeCredit || '[Not specified]'} |
| **Response Time Credit** | ${data.responseTimeCredit || '[Not specified]'} |
| **Scheduled Downtime** | ${data.scheduledDowntime || '[Not specified]'} |
`
}

const STANDARD_TERMS = stripSpans(`## Standard Terms

1. Uptime
    1. Target Uptime.  If there is a Target Uptime, Provider will use commercially reasonable efforts to make the Cloud Service available for at least the Target Uptime as calculated each calendar month.
    2. Calculating Uptime.  Provider and Customer agree to calculate availability of the Cloud Service as the total number of Available Minutes minus the number of Downtime Minutes, divided by the total number of Available Minutes, measured in a calendar month.

2. Response Time
    1. Target Response Time. If there is a Target Response Time, Provider will use commercially reasonable efforts to respond to support requests sent to the Support Channel within the Target Response Time.
    2. Calculating Response Time.  Provider and Customer agree to calculate Provider's response time as the total time between when Customer submits a support request to the Support Channel and when Provider or Provider's support representative specifically acknowledges the request. An automated response is not a specific acknowledgement for purposes of this SLA.

3. Remedies
    1. Service Credit.  If there is a Target Uptime and Cloud Service availability falls below the Target Uptime, Customer is eligible to receive an Uptime Credit. If there is a Target Response Time and neither Provider nor Provider's support representative acknowledge a support request submitted to the Support Channel within the Target Response Time, Customer is eligible to receive a Response Time Credit. Service Credits only apply towards future Cloud Service Fees owed by Customer to Provider.
    2. Requesting A Service Credit.  To receive a Service Credit, Customer must notify Provider within 7 days of the end of the month in which Customer believes the Service Credit was earned, otherwise Service Credit eligibility will expire for that month.
    3. Service Credit Limitations.  Service Credits may not be exchanged for, or converted to, monetary amounts. Service Credits do not earn interest. Service Credits will not accumulate within a single Subscription Period in an amount more than 8% of Cloud Service Fees for that Subscription Period. Service Credits expire when the applicable Order Form ends.
    4. Termination.  If the Cloud Service does not meet the Target Uptime for two (2) out of any three (3) consecutive months and Customer notified Provider of the failures within 7 days of the end of each impacted month, Customer may immediately terminate the affected Order Form by giving written notice to Provider.
    5. Exclusive Remedy.  This SLA describes Customer's exclusive remedy and Provider's entire liability for any failure of the Cloud Service to meet the Target Uptime and for any inability to meet the Target Response Time.

4. Definitions
    1. **"Available Minutes"** means the total number of minutes in a calendar month, minus Excluded Minutes and Scheduled Downtime.
    2. **"Downtime Minutes"** means the total number of minutes in a calendar month when the Cloud Service is not available to Customer, as confirmed by Provider's internal monitoring systems, minus Excluded Minutes and Scheduled Downtime.
    3. **"Excluded Minutes"** means when the Cloud Service is not available because of (a) a Force Majeure Event; (b) general Internet connectivity issues; (c) equipment or software made available by anyone other than Provider and that is not within Provider's reasonable control; or (d) Customer's use of the Cloud Service in a manner not authorized by the Agreement.
    4. **"Service Credit"** means the accrued Uptime Credit plus the accrued Response Time Credit.
    5. **"SLA Standard Terms"** means these Common Paper Service Level Agreement Standard Terms Version 2.0, which are posted at https://commonpaper.com/standards/service-level-agreement/2.0/.`)

export const slaConfig: DocumentConfig = {
  slug: 'sla',
  name: 'Service Level Agreement',
  description: 'A standard service level agreement defining uptime commitments, incident response, and remedies for service failures.',
  filename: 'sla.md',
  defaultData: {
    providerName: '',
    providerCompany: '',
    customerName: '',
    customerCompany: '',
    targetUptime: '',
    targetResponseTime: '',
    supportChannel: '',
    uptimeCredit: '',
    responseTimeCredit: '',
    scheduledDowntime: '',
    subscriptionPeriod: '',
  },
  buildPreviewMarkdown: (data) => buildCoverPage(data) + '\n\n---\n\n' + STANDARD_TERMS,
}
