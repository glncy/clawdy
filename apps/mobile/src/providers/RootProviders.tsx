import { ComponentProps, ElementType, ReactElement, ReactNode } from "react";

type ProviderFunction = (
  props: Pick<ComponentProps<ElementType>, "children">,
) => ReactElement;

type RootProvidersProps = {
  providers: ProviderFunction[];
  children: ReactNode;
};

/**
 * Composes multiple providers from an array of functions
 *
 * Usage:
 * ```tsx
 * <RootProviders
 *   providers={[
 *     (props) => <KeyboardProvider {...props} />,
 *     ...,
 *   ]}
 * >
 *   <App />
 * </RootProviders>
 * ```
 */
export function RootProviders({ providers, children }: RootProvidersProps) {
  return providers.reduceRight((acc, providerFn) => {
    return providerFn({ children: acc });
  }, children);
}
