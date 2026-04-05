# Card Management Manual Test Cases (TC-CARD)

These cases cover the user's ability to manage their payment methods within the application.

## [TC-CARD-001] Add New Payment Card
**Description:** Verify a user can successfully add a new card to their account.
- **Preconditions:** User is logged in and navigates to the Cards page.
- **Steps:**
  1. Click "Add Card" button.
  2. Enter valid card details (Name, Card Number, Expiry, CVC).
  3. Submit the form.
- **Expected:** 
  - New card appears in the card list.
  - Card number is masked (e.g., **** 1234).
  - Success message or indicator is shown.

## [TC-CARD-002] Remove Existing Card
**Description:** Verify a user can remove a non-primary payment method.
- **Preconditions:** User has at least two cards on file.
- **Steps:**
  1. Navigate to the Cards page.
  2. Select a secondary card and click "Remove" or the delete icon.
  3. Confirm the removal in the modal.
- **Expected:** 
  - Card is removed from the UI list.
  - User cannot remove the last card or primary card without a replacement.

## [TC-CARD-003] Set Primary Payment Method
**Description:** Verify a user can designate a specific card as their primary method for repayments.
- **Preconditions:** User has at least two cards on file.
- **Steps:**
  1. Navigate to the Cards page.
  2. Select a non-primary card.
  3. Click "Set as Primary" or use the toggle.
- **Expected:** 
  - Selected card now displays "Primary" label.
  - Previous primary card loses the "Primary" label.
  - Future repayments default to this card.
