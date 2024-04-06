function transformUserInputToWrite(userInput) {
    
    const questionToFeatureMapping = {
        "Select your age group!": { featureName: "Group_Age", valueMapping: { "18-25": "18-25", "26-35": "26-35", "36-45": "36-45", "46+": "46+" /* add all age groups */ }},
        "Select your gender!": { featureName: "Gender", valueMapping: { "Male": "Male", "Female": "Female" }},
        "Choose your current body type":{featureName: "Current_Body_Type", valueMapping: {"Average": "Average", "Slightly overweight": "Slightly overweight", "Overweight": "Overweight", "Plump": "Plump", "Extra": "Extra"}},
        "Choose the body type you want to have": {featureName: "Desired_Body_Type", valueMapping: {"Fit": "Fit", "Cut": "Cut", "Bulk": "Bulk", "Athletic": "Athletic", "Shapely": "Shapely"}},
        "What do you want to achieve?": {featureName: "Goals", valueMapping: {"Lose weight": "Lose weight", "Boost brain power": "Boost brain power", "Improve blood pressure": "Improve blood pressure", "Increase life expectancy": "Increase life expectancy", "Reduce cholesterol level": "Reduce cholesterol level", "Sleep better": "Sleep better", "Improve bone health": "Improve bone health", "Reduce the risk of cancer": "Reduce the risk of cancer"}},
        "Choose your target zones": {featureName: "Target_Zones", valueMapping: {"Belly": "Belly", "Butt": "Butt", "Pecs": "Pecs", "Legs": "Legs", "Breasts": "Breasts"}},
        "When were you last happy with your weight?": {featureName: "Last_Time_Happy_With_Weight", valueMapping: {"Less than a year ago": "Less than a year ago", "1 or 2 years ago": "1 or 2 years ago", "More than 3 years ago": "More than 3 years ago", "Never": "Never"}},
        "What time do you usually eat breakfast?": {featureName: "Breakfast_Timing", valueMapping: {"Before 7:00 am": "Before 7:00 am", "After 7:00 am": "After 7:00 am", "Between 9 to 11 am": "Between 9 to 11 am", "I usually skip breakfast": "I usually skip breakfast"}},
        "What about lunch?": {featureName: "Lunch_Timing", valueMapping: {"Before 1:00 pm": "Before 1:00 pm", "Between 1 and 2 pm": "Between 1 and 2 pm", "Between 2 and 4 pm": "Between 2 and 4 pm", "I usually skip lunch": "I usually skip lunch"}},
        "And what time do you have your dinner?": {featureName: "Dinner_Timing", valueMapping: {"Before 4:00 pm": "Before 4:00 pm", "Between 4 and 7 pm": "Between 4 and 7 pm", "After 7:00 pm": "After 7:00 pm", "I usually skip dinner": "I usually skip dinner"}},
        "Do you prefer to cook at home or eat out?": {featureName: "Cooking_Preference", valueMapping: {"I usually cook at home": "I usually cook at home", "I generally eat out": "I generally eat out", "I like to do both": "I like to do both"}},
        "What are your feelings about fasting for a whole weekend?": {featureName: "Feelings_About_Fasting", valueMapping: {"No problem!": "No problem!", "I will try": "I will try", "No way!": "No way!"}},
        "What is your activity level?": {featureName: "Activity_Level", valueMapping: {"Little or no exercise/no physical labor": "Little or no exercise/no physical labor", "Exercise 1-2 days per week/light physical labor": "Exercise 1-2 days per week/light physical labor", "Exercise 3-5 days per week/physical labor": "Exercise 3-5 days per week/physical labor", "Exercise 6-7 days per week/hard physical labor": "Exercise 6-7 days per week/hard physical labor"}},
        "How often do you work out?": {featureName: "Workout_Frequency", valueMapping: {"Every day": "Every day", "A few days a week": "A few days a week", "Once a week": "Once a week", "From time to time": "From time to time", "Never": "Never"}},
        "What is your workload like?": {featureName: "Workload", valueMapping: {"9 to 5": "9 to 5", "Night shifts": "Night shifts", "It's fairly flexible": "It's fairly flexible", "I don't work anymore": "I don't work anymore"}},
        "How active are you while at work?": {featureName: "Work_Activity_Level", valueMapping: {"I'm fairly inactive": "I'm fairly inactive", "Physical labor / pretty active": "Physical labor / pretty active", "A bit of both": "A bit of both"}},
        "What are you interested in?": {featureName: "Interests", valueMapping: {"Lose weight": "Lose weight", "Fat Burn": "Fat Burn", "Energy Boost": "Energy Boost", "Metabolism Boost": "Metabolism Boost", "Better Figure": "Better Figure", "Reduce Blood Sugar Levels": "Reduce Blood Sugar Levels", "Insulin Resistance": "Insulin Resistance", "Better Sleep": "Better Sleep", "Increased Life Expectancy": "Increased Life Expectancy", "Lowered Cholesterol Levels": "Lowered Cholesterol Levels", "Heart Health": "Heart Health"}},
        "Are you out of breath after walking up a flight of stairs?": {featureName: "Breathlessness_After_Stairs", valueMapping: {"I am so out of breath that I cannot talk": "I am so out of breath that I cannot talk", "I am somewhat out of breath but can talk": "I am somewhat out of breath but can talk", "I am OK after one flight of stairs": "I am OK after one flight of stairs", "I could walk up a few flights of stairs easily": "I could walk up a few flights of stairs easily"}},
        "How much time do you spend walking on a typical day?": {featureName: "Walking_Time_Per_Day", valueMapping: {"Less than 20 mins": "Less than 20 mins", "20-60 mins": "20-60 mins", "More than 60 mins": "More than 60 mins"}},
        "How much water do you drink every day?": {featureName: "Water_Intake", valueMapping: {"None, I drink coffee and tea": "None, I drink coffee and tea", "About 2 glasses (16 oz)": "About 2 glasses (16 oz)", "Between 2 and 6 glasses (0.5 - 1.5L)": "Between 2 and 6 glasses (0.5 - 1.5L)", "A lot - probably more than 6 glasses": "A lot - probably more than 6 glasses"}},
        "Truthfully, what is an average night like for you?": {featureName: "Average_Night_Sleep", valueMapping: {"Not enough rest (under 5 hours)": "Not enough rest (under 5 hours)", "Some sleep (5-6 hours)": "Some sleep (5-6 hours)", "A good rest (7-8 hours)": "A good rest (7-8 hours)", "I'm an expert sleeper (more than 8 hours)": "I'm an expert sleeper (more than 8 hours)"}},
        "Do you follow any of these dietary restrictions?": {featureName: "Dietary_Restrictions", valueMapping: {"No specific diet": "No specific diet", "Vegan - No animal products": "Vegan - No animal products", "Vegetarian - No meat or fish": "Vegetarian - No meat or fish", "Gluten-Free - No wheat, barley, or rye": "Gluten-Free - No wheat, barley, or rye"}},
        "Do you suffer from any of the following conditions?": {featureName: "Health_Conditions", valueMapping: {"No I don't": "No I don't", "Diabetes": "Diabetes", "Heart disease": "Heart disease", "High blood pressure": "High blood pressure", "High cholesterol": "High cholesterol", "Mental Health disorders": "Mental health disorders", "Chronic kidney disease (CKD)": "Chronic kidney disease (CKD)", "Cancer": "Cancer", "Gastrointestinal disorder": "Gastrointestinal disorder", "Physical disability": "Physical disability", "Other": "Other"}},
        "Are you taking any medication?": {featureName: "Medication", valueMapping: {"None of them": "None of them", "Vitamins": "Vitamins", "Hormones": "Hormones", "Antibiotics": "Antibiotics"}},
        "Do you have any serious back problems?": {featureName: "Back_Problems", valueMapping: {"Yes": "Yes", "No": "No"}},
        "Bad habits": {featureName: "Bad_Habits", valueMapping: {"None of them": "None of them", "Unable to rest enough": "Unable to rest enough", "I love chocolate and candy": "I love chocolate and candy", "Soda is my best friend": "Soda is my best friend", "I consume a lot of salty food": "I consume a lot of salty food", "I'm a midnight snacker": "I'm a midnight snacker"}},
        "What do you know about Intermittent Fasting?": {featureName: "Knowledge_About_Intermittent_Fasting", valueMapping: {"Only the name": "Only the name", "A couple of things": "A couple of things", "I'm experienced in fasting": "I'm experienced in fasting"}},
        "How excited are you to shed some extra weight?": {featureName: "Excitement_About_Weight_Loss", valueMapping: {"I just want to see what the buzz about fasting is about": "I just want to see what the buzz about fasting is about", "I want to try and lose some weight": "I want to try and lose some weight", "I'm serious about losing as much weight as possible": "I'm serious about losing as much weight as possible"}},
        "How tall are you?": {featureName: "Height"},
        "What is your current weight?": {featureName: "Current_Weight"},
        "What would you consider your perfect weight?": {featureName: "Perfect_Weight"},
        "What is your age?": {featureName: "Age"}
        
    };

    // Initialize an object to hold the transformed features
    let transformedFeatures = {};


    // Iterating over the user answers to transform and map them to model features
    userInput.forEach(answerObj => {
        let questionText = answerObj.question.en; // Assuming we're using the English version for keys
        let answerText = Array.isArray(answerObj.answer) ? answerObj.answer.map(a => a.en) : answerObj.answer.en;
        
        // Check if there is a mapping defined for this question
        if (questionToFeatureMapping[questionText]) {
            const mappingInfo = questionToFeatureMapping[questionText];

            if (["Height", "Current_Weight", "Perfect_Weight", "Age"].includes(mappingInfo.featureName)) {
                transformedFeatures[mappingInfo.featureName] = answerObj.answer.answer ? parseInt(answerObj.answer.answer) : parseInt(answerObj.answer);
            }
            else if (Array.isArray(answerText)) { // Handle multiple answers
                transformedFeatures[mappingInfo.featureName] = answerText.toString().replace(",", "; ");
            } else { // Handle single answer
                if (mappingInfo.valueMapping) { // Categorical mapping
                    transformedFeatures[mappingInfo.featureName] = mappingInfo.valueMapping[answerText] || answerText;
                } else { // Direct mapping
                    transformedFeatures[mappingInfo.featureName] = answerText;
                }
            }
        }
    });

    return transformedFeatures;
}

module.exports = transformUserInputToWrite;