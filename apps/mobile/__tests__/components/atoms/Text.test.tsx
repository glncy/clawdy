import { render } from "@testing-library/react-native";
import { AppText } from "@/components/atoms/Text";

describe("AppText", () => {
  it("renders children correctly", () => {
    const { getByText } = render(<AppText>Hello Resonance</AppText>);
    expect(getByText("Hello Resonance")).toBeTruthy();
  });

  it("applies size styles correctly", () => {
    const { getByText } = render(<AppText size="3xl">Big Text</AppText>);
    const textElement = getByText("Big Text");

    expect(textElement.props.className).toContain("text-3xl");
  });

  it("applies color styles correctly", () => {
    const { getByText } = render(
      <AppText color="primary">Purple Text</AppText>,
    );
    const textElement = getByText("Purple Text");

    // Check if Tailwind class is applied
    expect(textElement.props.className).toContain("text-primary");
  });

  it("applies weight styles correctly", () => {
    const { getByText } = render(<AppText weight="bold">Bold Text</AppText>);
    const textElement = getByText("Bold Text");

    expect(textElement.props.className).toContain("font-bold");
  });

  it("uses regular weight by default", () => {
    const { getByText } = render(<AppText>Regular Text</AppText>);
    const textElement = getByText("Regular Text");

    expect(textElement.props.className).not.toContain("font-bold");
  });
});
