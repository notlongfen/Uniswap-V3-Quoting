import { ExternalProvider } from '@metamask/providers'
import { decl } from 'postcss'

declare global {
    interface Window {
        ethereum: ExternalProvider
    }
}