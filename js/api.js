//  api.js 
console.log(" STARTING: api.js");

window.api = {
    isAvailable: function() {
        console.log(" api.isAvailable() called - returning false (demo mode)");
        return false;
    },
    
    login: async function(email, password, role) {
        console.log(` api.login() called for: ${email}`);
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log(" Falling back to localStorage");
        return null;
    },
    
    signup: async function(userData) {
        console.log(`api.signup() called for: ${userData.email}`);
        await new Promise(resolve => setTimeout(resolve, 100));
        return null;
    },
    
    saveQuiz: async function(quizData) {
        console.log(` api.saveQuiz() called: "${quizData.title}"`);
        await new Promise(resolve => setTimeout(resolve, 100));
        return { success: true, local: true };
    },
    
    submitResult: async function(result) {
        console.log(` api.submitResult() called: ${result.studentName} - ${result.score}`);
        await new Promise(resolve => setTimeout(resolve, 100));
        return { success: true, local: true };
    },
    
    getResults: async function() {
        console.log(" api.getResults() called");
        await new Promise(resolve => setTimeout(resolve, 100));
        return [];
    }
};

console.log(" COMPLETE: api.js loaded");
console.log("window.api created with methods:", Object.keys(window.api));