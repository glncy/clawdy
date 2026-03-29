import { render, screen } from "@testing-library/react";
import React from "react";

describe("UI Package", () => {
    it("renders a basic component", () => {
        render(<div>Hello UI</div>);
        expect(screen.getByText('Hello UI')).toBeInTheDocument();
    });
});
