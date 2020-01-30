/**
 * This is auto confirmation aws lambda used as trigger in aws cognito 
 *  https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-pre-sign-up.html#aws-lambda-triggers-pre-registration-example-2
 */
exports.handler = (event, context, callback) => {

    // Confirm the user
        event.response.autoConfirmUser = true;

    // Set the email as verified if it is in the request
    if (event.request.userAttributes.hasOwnProperty("email")) {
        event.response.autoVerifyEmail = true;
    }

    // Set the phone number as verified if it is in the request
    //if (event.request.userAttributes.hasOwnProperty("phone_number")) {
      //  event.response.autoVerifyPhone = true;
    //}

    // Return to Amazon Cognito
    callback(null, event);
};