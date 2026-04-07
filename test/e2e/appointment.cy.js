describe("Dental System", () => {

  it("open homepage", () => {
    cy.visit("http://localhost:3000");
    cy.contains("Appointment");
  });

  it("book appointment", () => {
    cy.visit("http://localhost:3000");

    cy.get('#name').type("John");
    cy.get('#date').type("2026-04-10");

    cy.get('#submit').click();

    cy.contains("success");
  });

});