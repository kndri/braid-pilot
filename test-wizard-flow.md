# Simplified Pricing Wizard Test Plan

## Test 1: New Setup Flow
1. Navigate to `/onboarding`
2. **Step 1: Style & Base Pricing**
   - Select 3-4 styles (e.g., Box Braids, Knotless Braids, Cornrows)
   - Try different pricing templates (Budget/Standard/Premium)
   - Verify prices update correctly
   - Add a custom style
   - Edit individual base prices

3. **Step 2: Universal Adjustments**
   - Verify default size pricing (Small=$40, Medium=$20, Large=$0, XL=-$10)
   - Test linear and exponential patterns
   - Adjust length pricing (Bra-Length=$0, Mid-Back=$20, Waist-Length=$40)
   - Verify hair type adjustments
   - Check the example calculation updates

4. **Step 3: Review & Customize**
   - Expand each style to view pricing matrix
   - Hover over prices to see edit pencil icon
   - Click pencil to edit individual prices
   - Verify manual edits are marked with purple dot
   - Test the customize adjustments feature
   - Click "Save & Complete"

## Test 2: Edit Mode Flow
1. Navigate to Dashboard → Settings → Pricing
2. Click "Edit Service Pricing" button
3. Verify existing data loads correctly
4. Make changes to pricing
5. Save and verify changes persist

## Test 3: Price Calculations
Verify pricing formula:
- Base Price + Size Adjustment + Length Adjustment + Hair Type = Final Price

Example for Box Braids:
- Base: $180
- Small head: +$40
- Waist-Length: +$40
- 100% Human Hair: +$50
- **Total: $310**

## Test 4: Edge Cases
- [ ] Empty style selection (should show error)
- [ ] Negative prices (should handle gracefully)
- [ ] Very large prices (>$9999)
- [ ] Quick template switching
- [ ] Manual price overrides persist through navigation

## Expected Results
- ✅ Size pricing: Smaller heads cost more, larger heads cost less
- ✅ Inline editing works on Review screen
- ✅ Manual price overrides are saved and displayed
- ✅ All data saves to Convex correctly
- ✅ Edit mode loads existing pricing data