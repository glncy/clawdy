import { render, screen } from "@testing-library/react";
import React from "react";

describe("Web App Home Page", () => {
    it("renders a basic component", () => {
        render(<div>Hello Web</div>);
        expect(screen.getByText('Hello Web')).toBeInTheDocument();
    });
});
