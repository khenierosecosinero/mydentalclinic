describe('Login Page', () => {
  it('should load the login page', () => {
    cy.visit('/login.html')
    cy.title().should('include', 'Login')
  })
})