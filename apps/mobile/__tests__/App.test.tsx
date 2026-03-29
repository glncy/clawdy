import { render } from "@testing-library/react-native";
import { View, Text } from "react-native";

describe("Mobile App", () => {
    it("renders a basic view without crashing", () => {
        const { getByText } = render(
            <View>
                <Text>Hello Mobile</Text>
            </View>
        );

        expect(getByText("Hello Mobile")).toBeTruthy();
    });
});
