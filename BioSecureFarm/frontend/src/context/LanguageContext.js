import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LanguageContext = createContext(null);

const translations = {
  en: {
    language: 'Language',
    english: 'English',
    tamil: 'தமிழ்',
    appTagline: 'AI & GIS Powered Livestock Management',
    landingTitle: 'Safer farms. Healthier livestock.',
    landingSubtitle: 'Monitor animal health, manage farms, and respond to risks with one secure platform.',
    getStarted: 'Get Started',
    signIn: 'Sign In',
    createAccount: 'Create Account',
    welcomeBack: 'Welcome Back',
    signInToAccount: 'Sign in to your account',
    emailAddress: 'Email Address',
    password: 'Password',
    enterEmail: 'Enter your email',
    enterPassword: 'Enter your password',
    forgotPassword: 'Forgot Password?',
    or: 'OR',
    farmer: 'Farmer',
    veterinarian: 'Veterinarian',
    govOfficer: 'Gov Officer',
    admin: 'Admin',
    noAccount: "Don't have an account?",
    register: 'Register',
    joinToday: 'Join BioSecure Farm today',
    fullName: 'Full Name *',
    mobileNumber: 'Mobile Number *',
    confirmPassword: 'Confirm Password *',
    enterFullName: 'Enter your full name',
    mobilePlaceholder: '+91 XXXXX XXXXX',
    minPassword: 'Min 6 characters',
    reenterPassword: 'Re-enter password',
    selectRole: 'Select Role *',
    manageFarms: 'Manage your farms & livestock',
    diagnoseAnimals: 'Diagnose & treat animals',
    monitorFarms: 'Monitor & regulate farms',
    systemAdministration: 'System administration',
    haveAccount: 'Already have an account?',
    error: 'Error',
    fillRequired: 'Please fill all required fields',
    passwordsMismatch: 'Passwords do not match',
    passwordLength: 'Password must be at least 6 characters',
    loginFailed: 'Login Failed',
    registrationFailed: 'Registration Failed'
  },
  ta: {
    language: 'மொழி',
    english: 'English',
    tamil: 'தமிழ்',
    appTagline: 'AI மற்றும் GIS மூலம் கால்நடை மேலாண்மை',
    landingTitle: 'பாதுகாப்பான பண்ணைகள். ஆரோக்கியமான கால்நடைகள்.',
    landingSubtitle: 'ஒரே பாதுகாப்பான தளத்தில் கால்நடை ஆரோக்கியத்தைக் கண்காணித்து, பண்ணைகளை நிர்வகித்து, ஆபத்துகளுக்கு பதிலளிக்கவும்.',
    getStarted: 'தொடங்குங்கள்',
    signIn: 'உள்நுழைக',
    createAccount: 'கணக்கை உருவாக்கு',
    welcomeBack: 'மீண்டும் வரவேற்கிறோம்',
    signInToAccount: 'உங்கள் கணக்கில் உள்நுழைக',
    emailAddress: 'மின்னஞ்சல் முகவரி',
    password: 'கடவுச்சொல்',
    enterEmail: 'உங்கள் மின்னஞ்சலை உள்ளிடவும்',
    enterPassword: 'உங்கள் கடவுச்சொல்லை உள்ளிடவும்',
    forgotPassword: 'கடவுச்சொல் மறந்துவிட்டதா?',
    or: 'அல்லது',
    farmer: 'விவசாயி',
    veterinarian: 'கால்நடை மருத்துவர்',
    govOfficer: 'அரசு அலுவலர்',
    admin: 'நிர்வாகி',
    noAccount: 'கணக்கு இல்லையா?',
    register: 'பதிவு செய்க',
    joinToday: 'இன்றே BioSecure Farm-ல் இணையுங்கள்',
    fullName: 'முழுப் பெயர் *',
    mobileNumber: 'கைபேசி எண் *',
    confirmPassword: 'கடவுச்சொல்லை உறுதிப்படுத்தவும் *',
    enterFullName: 'உங்கள் முழுப் பெயரை உள்ளிடவும்',
    mobilePlaceholder: '+91 XXXXX XXXXX',
    minPassword: 'குறைந்தது 6 எழுத்துகள்',
    reenterPassword: 'கடவுச்சொல்லை மீண்டும் உள்ளிடவும்',
    selectRole: 'பாத்திரத்தைத் தேர்ந்தெடுக்கவும் *',
    manageFarms: 'பண்ணைகள் மற்றும் கால்நடைகளை நிர்வகிக்கவும்',
    diagnoseAnimals: 'விலங்குகளைக் கண்டறிந்து சிகிச்சையளிக்கவும்',
    monitorFarms: 'பண்ணைகளைக் கண்காணித்து ஒழுங்குபடுத்தவும்',
    systemAdministration: 'கணினி நிர்வாகம்',
    haveAccount: 'ஏற்கனவே கணக்கு உள்ளதா?',
    error: 'பிழை',
    fillRequired: 'தேவையான அனைத்து புலங்களையும் நிரப்பவும்',
    passwordsMismatch: 'கடவுச்சொற்கள் பொருந்தவில்லை',
    passwordLength: 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்',
    loginFailed: 'உள்நுழைவு தோல்வியடைந்தது',
    registrationFailed: 'பதிவு தோல்வியடைந்தது'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    AsyncStorage.getItem('language').then(storedLanguage => {
      if (storedLanguage === 'en' || storedLanguage === 'ta') setLanguage(storedLanguage);
    });
  }, []);

  const changeLanguage = nextLanguage => {
    setLanguage(nextLanguage);
    AsyncStorage.setItem('language', nextLanguage);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};