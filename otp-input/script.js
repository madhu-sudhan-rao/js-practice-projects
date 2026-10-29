

const otpInputs = document.querySelectorAll('.otp-input__input')
let otp = ''

otpInputs.forEach((input) => {
    input.addEventListener("input", (e) => {
        const enteredValue = e.target.value
        
        if(isNumber(enteredValue)) {
            otp += enteredValue
            const currentIndex = Array.from(otpInputs).indexOf(document.activeElement)
            if(currentIndex < otpInputs.length - 1) {
                otpInputs[currentIndex + 1].focus()
            } else {
                otpInputs[0].focus();
            }
        } else {
            e.target.value = ''
        }
        
    })
} )

// Function to check if the entered character is a number
const isNumber = (text) => {
    return /^\d$/.test(text); // Ensure it checks for a single digit
};