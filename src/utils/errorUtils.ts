// Error handling utilities

export function getCleanErrorMessage(error: any): string {
  if (!error.message) {
    return 'خطای نامشخص';
  }

  const message = error.message;

  // Persian error messages
  if (message.includes('شما در 24 ساعت گذشته')) {
    return 'شما قبلاً به این فیلم رأی داده‌اید';
  }
  
  if (message.includes('شما قبلاً به این فیلم رأی داده‌اید')) {
    return 'شما قبلاً به این فیلم رأی داده‌اید';
  }
  
  if (message.includes('این فیلم قبلاً اضافه شده است')) {
    return 'این فیلم قبلاً اضافه شده است';
  }
  
  if (message.includes('این محتوا قبلاً اضافه شده است')) {
    return 'این محتوا قبلاً اضافه شده است';
  }
  
  if (message.includes('فیلم در TMDB یافت نشد')) {
    return 'فیلم در TMDB یافت نشد. لطفاً لینک یا شناسه صحیح وارد کنید';
  }
  
  if (message.includes('محتوای مورد نظر در TMDB یافت نشد')) {
    return 'محتوای مورد نظر در TMDB یافت نشد. لطفاً لینک یا شناسه صحیح وارد کنید';
  }
  
  if (message.includes('شما قبلاً با اضافه کردن این فیلم، رأی خود را داده‌اید')) {
    return 'شما قبلاً با اضافه کردن این فیلم، رأی خود را داده‌اید';
  }

  // Default error messages
  if (message.includes('voteForMovie')) {
    return 'خطا در رأی‌گیری';
  }
  
  if (message.includes('addMovie')) {
    return 'خطا در افزودن فیلم';
  }

  // Return original message if it's already clean
  return message;
}
