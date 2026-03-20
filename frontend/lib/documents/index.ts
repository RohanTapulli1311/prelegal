import { mutualNdaConfig } from './mutual-nda'
import { mutualNdaCoverpageConfig } from './mutual-nda-coverpage'
import { csaConfig } from './csa'
import { slaConfig } from './sla'
import { designPartnerConfig } from './design-partner'
import { psaConfig } from './psa'
import { dpaConfig } from './dpa'
import { partnershipConfig } from './partnership'
import { softwareLicenseConfig } from './software-license'
import { pilotConfig } from './pilot'
import { baaConfig } from './baa'
import { aiAddendumConfig } from './ai-addendum'

export interface DocumentConfig {
  slug: string
  name: string
  description: string
  filename: string
  defaultData: Record<string, string>
  buildPreviewMarkdown: (data: Record<string, string>) => string
}

export const documentRegistry: Record<string, DocumentConfig> = {
  'mutual-nda': mutualNdaConfig,
  'mutual-nda-coverpage': mutualNdaCoverpageConfig,
  'csa': csaConfig,
  'sla': slaConfig,
  'design-partner': designPartnerConfig,
  'psa': psaConfig,
  'dpa': dpaConfig,
  'partnership': partnershipConfig,
  'software-license': softwareLicenseConfig,
  'pilot': pilotConfig,
  'baa': baaConfig,
  'ai-addendum': aiAddendumConfig,
}

export function getDocumentConfig(slug: string): DocumentConfig | null {
  return documentRegistry[slug] ?? null
}

export const allDocuments: DocumentConfig[] = Object.values(documentRegistry)
