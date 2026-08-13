// utilities/validators.js
// Manual validation utility - No Zod dependency

// Helper function to format errors
const addError = (errors, field, message) => {
  errors.push({ field, message });
  return errors;
};

// Check if value is empty
const isEmpty = (value) => {
  return value === undefined || value === null || value === "";
};

// Check string length
const isLength = (value, min, max) => {
  if (isEmpty(value)) return false;
  const len = String(value).length;
  if (min && len < min) return false;
  if (max && len > max) return false;
  return true;
};

// Check email format
const isValidEmail = (email) => {
  if (isEmpty(email)) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Check phone number (Nigerian format)
const isValidPhone = (phone) => {
  if (isEmpty(phone)) return false;
  const phoneRegex = /^(\+234|0)[7-9][0-1][0-9]{8}$/;
  return phoneRegex.test(phone);
};

// Check if value is a valid URL
const isValidUrl = (url) => {
  if (isEmpty(url)) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Check if value is a number
const isNumber = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

// Check min value
const isMin = (value, min) => {
  if (isEmpty(value)) return false;
  return Number(value) >= min;
};

// Check enum
const isEnum = (value, allowedValues) => {
  if (isEmpty(value)) return false;
  return allowedValues.includes(value);
};

// Check regex pattern
const matchesPattern = (value, pattern) => {
  if (isEmpty(value)) return false;
  return pattern.test(value);
};

// Trim string
const trimString = (value) => {
  if (typeof value === "string") return value.trim();
  return value;
};

// To lowercase
const toLowerCase = (value) => {
  if (typeof value === "string") return value.toLowerCase();
  return value;
};

// ============= VALIDATION FUNCTIONS =============

// Email validation
export const validateEmail = (email) => {
  const errors = [];
  if (isEmpty(email)) {
    addError(errors, "email", "Email is required");
  } else if (!isValidEmail(email)) {
    addError(errors, "email", "Invalid email address");
  }
  return {
    success: errors.length === 0,
    data: email ? email.toLowerCase().trim() : email,
    errors,
  };
};

// Phone validation
export const validatePhone = (phone) => {
  const errors = [];
  if (isEmpty(phone)) {
    addError(errors, "phone", "Phone number is required");
  } else if (!isValidPhone(phone)) {
    addError(errors, "phone", "Invalid Nigerian phone number. Use format: 08012345678 or +2348012345678");
  }
  return {
    success: errors.length === 0,
    data: phone ? phone.trim() : phone,
    errors,
  };
};

// Password validation
export const validatePassword = (password) => {
  const errors = [];
  if (isEmpty(password)) {
    addError(errors, "password", "Password is required");
  } else if (password.length < 8) {
    addError(errors, "password", "Password must be at least 8 characters");
  } else if (!/[A-Z]/.test(password)) {
    addError(errors, "password", "Password must contain at least one uppercase letter");
  } else if (!/[a-z]/.test(password)) {
    addError(errors, "password", "Password must contain at least one lowercase letter");
  } else if (!/[0-9]/.test(password)) {
    addError(errors, "password", "Password must contain at least one number");
  }
  return {
    success: errors.length === 0,
    data: password,
    errors,
  };
};

// User Registration validation
export const validateUserRegistration = (data) => {
  const errors = [];
  const result = {};

  // Fullname validation
  if (isEmpty(data.fullname)) {
    addError(errors, "fullname", "Full name is required");
  } else if (!isLength(data.fullname, 2, 100)) {
    addError(errors, "fullname", "Full name must be between 2 and 100 characters");
  } else {
    result.fullname = trimString(data.fullname);
  }

  // Email validation
  if (isEmpty(data.email)) {
    addError(errors, "email", "Email is required");
  } else if (!isValidEmail(data.email)) {
    addError(errors, "email", "Invalid email address");
  } else {
    result.email = toLowerCase(trimString(data.email));
  }

  // Phone validation
  if (isEmpty(data.phone)) {
    addError(errors, "phone", "Phone number is required");
  } else if (!isValidPhone(data.phone)) {
    addError(errors, "phone", "Invalid Nigerian phone number");
  } else {
    result.phone = trimString(data.phone);
  }

  // Password validation
  if (isEmpty(data.password)) {
    addError(errors, "password", "Password is required");
  } else if (data.password.length < 8) {
    addError(errors, "password", "Password must be at least 8 characters");
  } else {
    result.password = data.password;
  }

  return {
    success: errors.length === 0,
    data: result,
    errors,
  };
};

// User Login validation
export const validateUserLogin = (data) => {
  const errors = [];
  const result = {};

  if (isEmpty(data.email)) {
    addError(errors, "email", "Email is required");
  } else if (!isValidEmail(data.email)) {
    addError(errors, "email", "Invalid email address");
  } else {
    result.email = toLowerCase(trimString(data.email));
  }

  if (isEmpty(data.password)) {
    addError(errors, "password", "Password is required");
  } else {
    result.password = data.password;
  }

  return {
    success: errors.length === 0,
    data: result,
    errors,
  };
};

// Password Reset validation
export const validatePasswordReset = (data) => {
  const errors = [];
  const result = {};

  if (isEmpty(data.email)) {
    addError(errors, "email", "Email is required");
  } else if (!isValidEmail(data.email)) {
    addError(errors, "email", "Invalid email address");
  } else {
    result.email = toLowerCase(trimString(data.email));
  }

  if (isEmpty(data.newPassword)) {
    addError(errors, "newPassword", "New password is required");
  } else if (data.newPassword.length < 8) {
    addError(errors, "newPassword", "Password must be at least 8 characters");
  } else {
    result.newPassword = data.newPassword;
  }

  return {
    success: errors.length === 0,
    data: result,
    errors,
  };
};

// Update Settings validation
export const validateUpdateSettings = (data) => {
  const errors = [];
  const result = {};

  if (!isEmpty(data.fullname)) {
    if (!isLength(data.fullname, 2, 100)) {
      addError(errors, "fullname", "Full name must be between 2 and 100 characters");
    } else {
      result.fullname = trimString(data.fullname);
    }
  }

  if (!isEmpty(data.phone)) {
    if (!isValidPhone(data.phone)) {
      addError(errors, "phone", "Invalid Nigerian phone number");
    } else {
      result.phone = trimString(data.phone);
    }
  }

  if (!isEmpty(data.image)) {
    result.image = data.image;
  }


  return {
    success: errors.length === 0,
    data: result,
    errors,
  };
};

// Profile Update validation (no password required)
export const validateProfileUpdate = (data) => {
  const errors = [];
  const result = {};

  if (!isEmpty(data.fullname)) {
    if (!isLength(data.fullname, 2, 100)) {
      addError(errors, "fullname", "Full name must be between 2 and 100 characters");
    } else {
      result.fullname = trimString(data.fullname);
    }
  }

  if (!isEmpty(data.phone)) {
    if (!isValidPhone(data.phone)) {
      addError(errors, "phone", "Invalid Nigerian phone number");
    } else {
      result.phone = trimString(data.phone);
    }
  }

  if (!isEmpty(data.image)) {
    result.image = data.image;
  }

  return {
    success: errors.length === 0,
    data: result,
    errors,
  };
};

// ============= STORE VALIDATIONS =============

// Business Hours validation
export const validateBusinessHours = (data) => {
  const errors = [];
  const result = {};

  if (!data) {
    return { success: true, data: {}, errors: [] };
  }

  if (data.alwaysOpen !== undefined) {
    result.alwaysOpen = data.alwaysOpen === true;
  }

  if (data.times && Array.isArray(data.times)) {
    result.times = [];
    const validDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    
    for (let i = 0; i < data.times.length; i++) {
      const time = data.times[i];
      const timeErrors = [];
      
      if (!validDays.includes(time.day)) {
        addError(timeErrors, "day", "Invalid day of week");
        continue;
      }
      
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(time.from)) {
        addError(timeErrors, "from", "Invalid time format. Use HH:MM");
      }
      if (!timeRegex.test(time.to)) {
        addError(timeErrors, "to", "Invalid time format. Use HH:MM");
      }
      
      if (timeErrors.length === 0) {
        result.times.push({
          day: time.day,
          from: time.from || "09:00",
          to: time.to || "17:00",
        });
      } else {
        timeErrors.forEach(err => addError(errors, `times[${i}].${err.field}`, err.message));
      }
    }
  }

  return {
    success: errors.length === 0,
    data: result,
    errors,
  };
};

// Store Registration validation
export const validateStoreRegistration = (data) => {
  const errors = [];
  const result = {};

  // Store Name
  if (isEmpty(data.storeName)) {
    addError(errors, "storeName", "Store name is required");
  } else if (!isLength(data.storeName, 2, 100)) {
    addError(errors, "storeName", "Store name must be between 2 and 100 characters");
  } else {
    result.storeName = toLowerCase(trimString(data.storeName));
  }

  // Description (optional)
  if (!isEmpty(data.description)) {
    if (data.description.length > 1000) {
      addError(errors, "description", "Description cannot exceed 1000 characters");
    } else {
      result.description = trimString(data.description);
    }
  }

  // Image (optional)
  if (!isEmpty(data.image)) {
    result.image = data.image;
  } else {
    result.image = { src: "", id: "" };
  }

  // Phone
  if (isEmpty(data.phone)) {
    addError(errors, "phone", "Phone number is required");
  } else if (!isValidPhone(data.phone)) {
    addError(errors, "phone", "Invalid phone number format");
  } else {
    result.phone = trimString(data.phone);
  }

  // Address
  if (isEmpty(data.address)) {
    addError(errors, "address", "Address is required");
  } else if (!isLength(data.address, 5, 500)) {
    addError(errors, "address", "Address must be between 5 and 500 characters");
  } else {
    result.address = trimString(data.address);
  }

  // State
  if (isEmpty(data.state)) {
    addError(errors, "state", "State is required");
  } else {
    result.state = toLowerCase(trimString(data.state));
  }

  // Business Hours (optional)
  if (data.businessHours) {
    const hoursValidation = validateBusinessHours(data.businessHours);
    if (!hoursValidation.success) {
      hoursValidation.errors.forEach(err => errors.push(err));
    } else {
      result.businessHours = hoursValidation.data;
    }
  } else {
    result.businessHours = { alwaysOpen: false, times: [] };
  }

  // Account Details
  if (data.accountDetails) {
    if (isEmpty(data.accountDetails.bankName)) {
      addError(errors, "accountDetails.bankName", "Bank name is required");
    } else {
      result.accountDetails = result.accountDetails || {};
      result.accountDetails.bankName = trimString(data.accountDetails.bankName);
    }

    if (isEmpty(data.accountDetails.accountName)) {
      addError(errors, "accountDetails.accountName", "Account name is required");
    } else {
      result.accountDetails = result.accountDetails || {};
      result.accountDetails.accountName = trimString(data.accountDetails.accountName);
    }

    if (isEmpty(data.accountDetails.accountNumber)) {
      addError(errors, "accountDetails.accountNumber", "Account number is required");
    } else if (!/^[0-9]{10}$/.test(data.accountDetails.accountNumber)) {
      addError(errors, "accountDetails.accountNumber", "Account number must be 10 digits");
    } else {
      result.accountDetails = result.accountDetails || {};
      result.accountDetails.accountNumber = trimString(data.accountDetails.accountNumber);
    }
  } else {
    addError(errors, "accountDetails", "Bank account details are required");
  }

  return {
    success: errors.length === 0,
    data: result,
    errors,
  };
};

// Store Update validation
export const validateStoreUpdate = (data) => {
  const errors = [];
  const result = {};

  if (!isEmpty(data.storeName)) {
    if (!isLength(data.storeName, 2, 100)) {
      addError(errors, "storeName", "Store name must be between 2 and 100 characters");
    } else {
      result.storeName = toLowerCase(trimString(data.storeName));
    }
  }

  if (!isEmpty(data.description)) {
    if (data.description.length > 1000) {
      addError(errors, "description", "Description cannot exceed 1000 characters");
    } else {
      result.description = trimString(data.description);
    }
  }

  if (!isEmpty(data.phone)) {
    if (!isValidPhone(data.phone)) {
      addError(errors, "phone", "Invalid phone number format");
    } else {
      result.phone = trimString(data.phone);
    }
  }

  if (!isEmpty(data.address)) {
    if (!isLength(data.address, 5, 500)) {
      addError(errors, "address", "Address must be between 5 and 500 characters");
    } else {
      result.address = trimString(data.address);
    }
  }

  if (!isEmpty(data.state)) {
    result.state = toLowerCase(trimString(data.state));
  }

  if (!isEmpty(data.image)) {
    result.image = data.image;
  }

  return {
    success: errors.length === 0,
    data: result,
    errors,
  };
};

// Account Details validation
export const validateAccountDetails = (data) => {
  const errors = [];
  const result = {};

  if (isEmpty(data.bankName)) {
    addError(errors, "bankName", "Bank name is required");
  } else {
    result.bankName = trimString(data.bankName);
  }

  if (isEmpty(data.accountName)) {
    addError(errors, "accountName", "Account name is required");
  } else {
    result.accountName = trimString(data.accountName);
  }

  if (isEmpty(data.accountNumber)) {
    addError(errors, "accountNumber", "Account number is required");
  } else if (!/^[0-9]{10}$/.test(data.accountNumber)) {
    addError(errors, "accountNumber", "Account number must be 10 digits");
  } else {
    result.accountNumber = trimString(data.accountNumber);
  }

  return {
    success: errors.length === 0,
    data: result,
    errors,
  };
};

// ============= ORDER VALIDATIONS =============

// Create Order validation
export const validateCreateOrder = (data) => {
  const errors = [];
  const result = {};

  if (isEmpty(data.storeId)) {
    addError(errors, "storeId", "Store ID is required");
  } else {
    result.storeId = data.storeId;
  }

  if (isEmpty(data.customerName)) {
    addError(errors, "customerName", "Customer name is required");
  } else {
    result.customerName = trimString(data.customerName);
  }

  if (isEmpty(data.customerPhone)) {
    addError(errors, "customerPhone", "Customer phone is required");
  } else if (!isValidPhone(data.customerPhone)) {
    addError(errors, "customerPhone", "Invalid phone number");
  } else {
    result.customerPhone = trimString(data.customerPhone);
  }

  if (isEmpty(data.products) || !Array.isArray(data.products) || data.products.length === 0) {
    addError(errors, "products", "At least one product is required");
  } else {
    result.products = [];
    for (let i = 0; i < data.products.length; i++) {
      const product = data.products[i];
      if (isEmpty(product.name)) {
        addError(errors, `products[${i}].name`, "Product name is required");
      } else if (isEmpty(product.price) || !isNumber(product.price) || product.price < 0) {
        addError(errors, `products[${i}].price`, "Valid product price is required");
      } else if (isEmpty(product.quantity) || !isNumber(product.quantity) || product.quantity < 1) {
        addError(errors, `products[${i}].quantity`, "Quantity must be at least 1");
      } else {
        result.products.push({
          name: trimString(product.name),
          price: Number(product.price),
          quantity: Number(product.quantity),
        });
      }
    }
  }

  if (isEmpty(data.totalAmount) || !isNumber(data.totalAmount) || data.totalAmount < 0) {
    addError(errors, "totalAmount", "Valid total amount is required");
  } else {
    result.totalAmount = Number(data.totalAmount);
  }

  if (isEmpty(data.deliveryAddress)) {
    addError(errors, "deliveryAddress", "Delivery address is required");
  } else {
    result.deliveryAddress = trimString(data.deliveryAddress);
  }

  if (!isEmpty(data.deliveryChannel)) {
    const validChannels = ["store", "busypilot"];
    if (!validChannels.includes(data.deliveryChannel)) {
      addError(errors, "deliveryChannel", "Invalid delivery channel");
    } else {
      result.deliveryChannel = data.deliveryChannel;
    }
  } else {
    result.deliveryChannel = "store";
  }

  return {
    success: errors.length === 0,
    data: result,
    errors,
  };
};

// Update Order Status validation
export const validateUpdateOrderStatus = (data) => {
  const errors = [];
  const result = {};
  const validStatuses = ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"];

  if (isEmpty(data.status)) {
    addError(errors, "status", "Status is required");
  } else if (!validStatuses.includes(data.status)) {
    addError(errors, "status", "Invalid status value");
  } else {
    result.status = data.status;
  }

  return {
    success: errors.length === 0,
    data: result,
    errors,
  };
};

// Update Payment Status validation
export const validateUpdatePaymentStatus = (data) => {
  const errors = [];
  const result = {};
  const validStatuses = ["pending", "verified", "unverified"];

  if (isEmpty(data.paymentStatus)) {
    addError(errors, "paymentStatus", "Payment status is required");
  } else if (!validStatuses.includes(data.paymentStatus)) {
    addError(errors, "paymentStatus", "Invalid payment status value");
  } else {
    result.paymentStatus = data.paymentStatus;
  }

  if (!isEmpty(data.paymentReference)) {
    result.paymentReference = trimString(data.paymentReference);
  }

  return {
    success: errors.length === 0,
    data: result,
    errors,
  };
};

// ============= CHAT VALIDATIONS =============

// Chat Message validation
export const validateChatMessage = (data) => {
  const errors = [];
  const result = {};

  if (isEmpty(data.message)) {
    addError(errors, "message", "Message is required");
  } else if (data.message.length > 2000) {
    addError(errors, "message", "Message cannot exceed 2000 characters");
  } else {
    result.message = trimString(data.message);
  }

  if (isEmpty(data.customerPhone)) {
    addError(errors, "customerPhone", "Customer phone is required");
  } else if (!isValidPhone(data.customerPhone)) {
    addError(errors, "customerPhone", "Invalid phone number");
  } else {
    result.customerPhone = trimString(data.customerPhone);
  }

  return {
    success: errors.length === 0,
    data: result,
    errors,
  };
};

// ============= BOT VALIDATIONS =============

// Bot Config validation
export const validateBotConfig = (data) => {
  const errors = [];
  const result = {};

  if (isEmpty(data.botName)) {
    addError(errors, "botName", "Bot name is required");
  } else {
    result.botName = toLowerCase(trimString(data.botName));
  }

  if (data.provider) {
    result.provider = {};
    if (isEmpty(data.provider.name)) {
      addError(errors, "provider.name", "Provider name is required");
    } else if (!["twilio", "meta"].includes(data.provider.name)) {
      addError(errors, "provider.name", "Invalid provider");
    } else {
      result.provider.name = data.provider.name;
    }

    if (isEmpty(data.provider.whatsappNumber)) {
      addError(errors, "provider.whatsappNumber", "WhatsApp number is required");
    } else {
      result.provider.whatsappNumber = trimString(data.provider.whatsappNumber);
    }

    if (isEmpty(data.provider.webhookUrl)) {
      addError(errors, "provider.webhookUrl", "Webhook URL is required");
    } else if (!isValidUrl(data.provider.webhookUrl)) {
      addError(errors, "provider.webhookUrl", "Invalid webhook URL");
    } else {
      result.provider.webhookUrl = trimString(data.provider.webhookUrl);
    }
  }

  if (data.messages) {
    result.messages = {};
    if (isEmpty(data.messages.systemMessage)) {
      addError(errors, "messages.systemMessage", "System message is required");
    } else {
      result.messages.systemMessage = trimString(data.messages.systemMessage);
    }

    if (!isEmpty(data.messages.welcomeMessage)) {
      result.messages.welcomeMessage = trimString(data.messages.welcomeMessage);
    }

    if (!isEmpty(data.messages.fallbackMessage)) {
      result.messages.fallbackMessage = trimString(data.messages.fallbackMessage);
    }
  }

  return {
    success: errors.length === 0,
    data: result,
    errors,
  };
};

// ============= PRODUCT VALIDATIONS =============

// Menu Product validation
export const validateMenuProduct = (data) => {
  const errors = [];
  const result = {};

  if (isEmpty(data.name)) {
    addError(errors, "name", "Product name is required");
  } else if (!isLength(data.name, 2, 100)) {
    addError(errors, "name", "Product name must be between 2 and 100 characters");
  } else {
    result.name = toLowerCase(trimString(data.name));
  }

  if (isEmpty(data.price)) {
    addError(errors, "price", "Price is required");
  } else if (!isNumber(data.price) || data.price < 0) {
    addError(errors, "price", "Price must be a positive number");
  } else {
    result.price = Number(data.price);
  }

  if (!isEmpty(data.description)) {
    if (data.description.length > 500) {
      addError(errors, "description", "Description cannot exceed 500 characters");
    } else {
      result.description = trimString(data.description);
    }
  }

  if (data.available !== undefined) {
    result.available = data.available === true;
  } else {
    result.available = true;
  }

  if (!isEmpty(data.image)) {
    result.image = data.image;
  }

  return {
    success: errors.length === 0,
    data: result,
    errors,
  };
};

// Bulk Products validation
export const validateBulkProducts = (data) => {
  const errors = [];
  const result = { products: [] };

  if (!data.products || !Array.isArray(data.products) || data.products.length === 0) {
    addError(errors, "products", "At least one product is required");
  } else {
    for (let i = 0; i < data.products.length; i++) {
      const productValidation = validateMenuProduct(data.products[i]);
      if (!productValidation.success) {
        productValidation.errors.forEach(err => {
          addError(errors, `products[${i}].${err.field}`, err.message);
        });
      } else {
        result.products.push(productValidation.data);
      }
    }
  }

  return {
    success: errors.length === 0,
    data: result,
    errors,
  };
};

// ============= HELPER FUNCTIONS =============

// Get first error message
export const getFirstError = (validationResult) => {
  if (validationResult.success) return null;
  return validationResult.errors[0]?.message || "Validation failed";
};

// Get all error messages as array
export const getErrorMessages = (validationResult) => {
  if (validationResult.success) return [];
  return validationResult.errors.map(err => err.message);
};

// Format errors for response
export const formatValidationErrors = (validationResult) => {
  if (validationResult.success) return null;
  return {
    message: validationResult.errors[0]?.message || "Validation failed",
    errors: validationResult.errors,
  };
};

// ============= ORDER VALIDATORS (missing) =============

// Pickup status update
export const validatePickupStatus = (data) => {
  const errors = [];
  const result = {};
  const valid = ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"];

  if (isEmpty(data.status)) {
    addError(errors, "status", "Status is required");
  } else if (!valid.includes(data.status)) {
    addError(errors, "status", `Status must be one of: ${valid.join(", ")}`);
  } else {
    result.status = data.status;
  }

  if (!isEmpty(data.estimatedTime)) {
    result.estimatedTime = trimString(String(data.estimatedTime));
  }

  if (!isEmpty(data.reason)) {
    if (data.reason.length > 500) {
      addError(errors, "reason", "Reason cannot exceed 500 characters");
    } else {
      result.reason = trimString(data.reason);
    }
  }

  return { success: errors.length === 0, data: result, errors };
};

// BusyPilot pickup request
export const validateBusyPilotPickup = (data) => {
  const errors = [];
  const result = {};

  if (!isEmpty(data.message)) {
    if (data.message.length > 1000) {
      addError(errors, "message", "Message cannot exceed 1000 characters");
    } else {
      result.message = trimString(data.message);
    }
  }

  if (!isEmpty(data.pickupTime)) {
    result.pickupTime = trimString(String(data.pickupTime));
  }

  return { success: errors.length === 0, data: result, errors };
};

// Notify customer
export const validateNotifyCustomer = (data) => {
  const errors = [];
  const result = {};

  if (isEmpty(data.message)) {
    addError(errors, "message", "Message is required");
  } else if (data.message.length > 1000) {
    addError(errors, "message", "Message cannot exceed 1000 characters");
  } else {
    result.message = trimString(data.message);
  }

  return { success: errors.length === 0, data: result, errors };
};

// ============= BOT VALIDATORS (missing) =============

// Create bot
export const validateCreateBot = (data) => {
  const errors = [];
  const result = {};

  if (!isEmpty(data.botName)) {
    if (!isLength(data.botName, 2, 100)) {
      addError(errors, "botName", "Bot name must be between 2 and 100 characters");
    } else {
      result.botName = trimString(data.botName);
    }
  }

  if (data.messages) {
    result.messages = {};
    if (!isEmpty(data.messages.systemMessage)) {
      if (data.messages.systemMessage.length > 2000) {
        addError(errors, "messages.systemMessage", "System message cannot exceed 2000 characters");
      } else {
        result.messages.systemMessage = trimString(data.messages.systemMessage);
      }
    }
    if (!isEmpty(data.messages.welcomeMessage)) {
      result.messages.welcomeMessage = trimString(data.messages.welcomeMessage);
    }
    if (!isEmpty(data.messages.fallbackMessage)) {
      result.messages.fallbackMessage = trimString(data.messages.fallbackMessage);
    }
    if (!isEmpty(data.messages.paymentInstructions)) {
      result.messages.paymentInstructions = trimString(data.messages.paymentInstructions);
    }
  }

  if (data.automation !== undefined) result.automation = data.automation;
  if (data.notifications !== undefined) result.notifications = data.notifications;
  if (data.features !== undefined) result.features = data.features;

  return { success: errors.length === 0, data: result, errors };
};

// Bot status update
export const validateBotStatus = (data) => {
  const errors = [];
  const result = {};
  const valid = ["active", "inactive", "suspended"];

  if (isEmpty(data.status)) {
    addError(errors, "status", "Status is required");
  } else if (!valid.includes(data.status)) {
    addError(errors, "status", `Status must be one of: ${valid.join(", ")}`);
  } else {
    result.status = data.status;
  }

  return { success: errors.length === 0, data: result, errors };
};

// Connect WhatsApp
export const validateConnectWhatsApp = (data) => {
  const errors = [];
  const result = {};

  if (isEmpty(data.phoneNumber)) {
    addError(errors, "phoneNumber", "Phone number is required");
  } else {
    result.phoneNumber = trimString(String(data.phoneNumber));
  }

  return { success: errors.length === 0, data: result, errors };
};

// Send test WhatsApp message
export const validateSendTestMessage = (data) => {
  const errors = [];
  const result = {};

  if (isEmpty(data.to)) {
    addError(errors, "to", "Recipient phone number is required");
  } else {
    result.to = trimString(String(data.to));
  }

  if (isEmpty(data.message)) {
    addError(errors, "message", "Message is required");
  } else if (data.message.length > 1000) {
    addError(errors, "message", "Message cannot exceed 1000 characters");
  } else {
    result.message = trimString(data.message);
  }

  return { success: errors.length === 0, data: result, errors };
};

// Bot test message
export const validateTestBot = (data) => {
  const errors = [];
  const result = {};

  if (isEmpty(data.message)) {
    addError(errors, "message", "Message is required");
  } else if (data.message.length > 1000) {
    addError(errors, "message", "Message cannot exceed 1000 characters");
  } else {
    result.message = trimString(data.message);
  }

  return { success: errors.length === 0, data: result, errors };
};

// ============= CHAT VALIDATORS (missing) =============

// Send message to customer (from dashboard)
export const validateSendMessage = (data) => {
  const errors = [];
  const result = {};

  if (isEmpty(data.text) && isEmpty(data.imageUrl)) {
    addError(errors, "text", "Either text or imageUrl is required");
  }

  if (!isEmpty(data.text)) {
    if (data.text.length > 2000) {
      addError(errors, "text", "Text cannot exceed 2000 characters");
    } else {
      result.text = trimString(data.text);
    }
  }

  if (!isEmpty(data.imageUrl)) {
    if (!isValidUrl(data.imageUrl)) {
      addError(errors, "imageUrl", "Invalid image URL");
    } else {
      result.imageUrl = data.imageUrl;
    }
  }

  if (!isEmpty(data.messageType)) {
    const valid = ["text", "image", "audio", "video", "document"];
    if (!valid.includes(data.messageType)) {
      addError(errors, "messageType", `messageType must be one of: ${valid.join(", ")}`);
    } else {
      result.messageType = data.messageType;
    }
  } else {
    result.messageType = "text";
  }

  return { success: errors.length === 0, data: result, errors };
};

// ============= NOTIFICATION VALIDATORS (missing) =============

// Support form
export const validateSupportForm = (data) => {
  const errors = [];
  const result = {};

  if (isEmpty(data.email)) {
    addError(errors, "email", "Email is required");
  } else if (!isValidEmail(data.email)) {
    addError(errors, "email", "Invalid email address");
  } else {
    result.email = toLowerCase(trimString(data.email));
  }

  if (isEmpty(data.subject)) {
    addError(errors, "subject", "Subject is required");
  } else if (!isLength(data.subject, 3, 200)) {
    addError(errors, "subject", "Subject must be between 3 and 200 characters");
  } else {
    result.subject = trimString(data.subject);
  }

  if (isEmpty(data.issue)) {
    addError(errors, "issue", "Issue type is required");
  } else {
    result.issue = trimString(data.issue);
  }

  if (isEmpty(data.message)) {
    addError(errors, "message", "Message is required");
  } else if (!isLength(data.message, 10, 5000)) {
    addError(errors, "message", "Message must be between 10 and 5000 characters");
  } else {
    result.message = trimString(data.message);
  }

  if (!isEmpty(data.priority)) {
    const valid = ["low", "medium", "high", "urgent"];
    if (!valid.includes(data.priority)) {
      addError(errors, "priority", `Priority must be one of: ${valid.join(", ")}`);
    } else {
      result.priority = data.priority;
    }
  } else {
    result.priority = "medium";
  }

  return { success: errors.length === 0, data: result, errors };
};

// Admin create notification
export const validateAdminCreateNotification = (data) => {
  const errors = [];
  const result = {};

  if (isEmpty(data.userId)) {
    addError(errors, "userId", "userId is required (use 'all' to broadcast)");
  } else {
    result.userId = trimString(String(data.userId));
  }

  if (isEmpty(data.title)) {
    addError(errors, "title", "Title is required");
  } else if (!isLength(data.title, 2, 200)) {
    addError(errors, "title", "Title must be between 2 and 200 characters");
  } else {
    result.title = trimString(data.title);
  }

  if (isEmpty(data.message)) {
    addError(errors, "message", "Message is required");
  } else if (data.message.length > 2000) {
    addError(errors, "message", "Message cannot exceed 2000 characters");
  } else {
    result.message = trimString(data.message);
  }

  if (!isEmpty(data.type)) {
    const valid = ["info", "success", "warning", "error"];
    if (!valid.includes(data.type)) {
      addError(errors, "type", `Type must be one of: ${valid.join(", ")}`);
    } else {
      result.type = data.type;
    }
  } else {
    result.type = "info";
  }

  result.sendEmail = data.sendEmail === true;
  if (data.metadata !== undefined) result.metadata = data.metadata;

  return { success: errors.length === 0, data: result, errors };
};

// Admin update notification
export const validateAdminUpdateNotification = (data) => {
  const errors = [];
  const result = {};

  if (!isEmpty(data.title)) {
    if (!isLength(data.title, 2, 200)) {
      addError(errors, "title", "Title must be between 2 and 200 characters");
    } else {
      result.title = trimString(data.title);
    }
  }

  if (!isEmpty(data.message)) {
    if (data.message.length > 2000) {
      addError(errors, "message", "Message cannot exceed 2000 characters");
    } else {
      result.message = trimString(data.message);
    }
  }

  if (!isEmpty(data.type)) {
    const valid = ["info", "success", "warning", "error"];
    if (!valid.includes(data.type)) {
      addError(errors, "type", `Type must be one of: ${valid.join(", ")}`);
    } else {
      result.type = data.type;
    }
  }

  if (data.isRead !== undefined) {
    result.isRead = data.isRead === true;
  }

  if (data.metadata !== undefined) result.metadata = data.metadata;

  return { success: errors.length === 0, data: result, errors };
};

// ============= ADMIN USER VALIDATORS (missing) =============

// Admin update user
export const validateAdminUpdateUser = (data) => {
  const errors = [];
  const result = {};

  if (!isEmpty(data.fullname)) {
    if (!isLength(data.fullname, 2, 100)) {
      addError(errors, "fullname", "Full name must be between 2 and 100 characters");
    } else {
      result.fullname = trimString(data.fullname);
    }
  }

  if (!isEmpty(data.phone)) {
    if (!isValidPhone(data.phone)) {
      addError(errors, "phone", "Invalid Nigerian phone number");
    } else {
      result.phone = trimString(data.phone);
    }
  }

  if (!isEmpty(data.email)) {
    if (!isValidEmail(data.email)) {
      addError(errors, "email", "Invalid email address");
    } else {
      result.email = toLowerCase(trimString(data.email));
    }
  }

  if (data.active !== undefined) {
    result.active = data.active === true;
  }

  return { success: errors.length === 0, data: result, errors };
};

// Admin change user role
export const validateChangeRole = (data) => {
  const errors = [];
  const result = {};
  const valid = ["user", "admin", "support", "super"];

  if (isEmpty(data.role)) {
    addError(errors, "role", "Role is required");
  } else if (!valid.includes(data.role)) {
    addError(errors, "role", `Role must be one of: ${valid.join(", ")}`);
  } else {
    result.role = data.role;
  }

  return { success: errors.length === 0, data: result, errors };
};

// Admin notify user
export const validateAdminNotifyUser = (data) => {
  const errors = [];
  const result = {};

  if (isEmpty(data.title)) {
    addError(errors, "title", "Title is required");
  } else if (!isLength(data.title, 2, 200)) {
    addError(errors, "title", "Title must be between 2 and 200 characters");
  } else {
    result.title = trimString(data.title);
  }

  if (isEmpty(data.message)) {
    addError(errors, "message", "Message is required");
  } else if (data.message.length > 2000) {
    addError(errors, "message", "Message cannot exceed 2000 characters");
  } else {
    result.message = trimString(data.message);
  }

  if (!isEmpty(data.type)) {
    const valid = ["info", "success", "warning", "error"];
    if (!valid.includes(data.type)) {
      addError(errors, "type", `Type must be one of: ${valid.join(", ")}`);
    } else {
      result.type = data.type;
    }
  } else {
    result.type = "info";
  }

  result.sendEmail = data.sendEmail === true;

  return { success: errors.length === 0, data: result, errors };
};

// Admin reset user password
export const validateAdminResetPassword = (data) => {
  const errors = [];
  const result = {};

  if (isEmpty(data.newPassword)) {
    addError(errors, "newPassword", "New password is required");
  } else if (data.newPassword.length < 8) {
    addError(errors, "newPassword", "Password must be at least 8 characters");
  } else {
    result.newPassword = data.newPassword;
  }

  return { success: errors.length === 0, data: result, errors };
};

// ============= ADMIN ORDER VALIDATORS (missing) =============

// Admin update order (pickupStatus + paymentStatus together)
export const validateAdminUpdateOrder = (data) => {
  const errors = [];
  const result = {};
  const validPickup = ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"];
  const validPayment = ["pending", "verified", "unverified"];

  if (!isEmpty(data.pickupStatus)) {
    if (!validPickup.includes(data.pickupStatus)) {
      addError(errors, "pickupStatus", `pickupStatus must be one of: ${validPickup.join(", ")}`);
    } else {
      result.pickupStatus = data.pickupStatus;
    }
  }

  if (!isEmpty(data.paymentStatus)) {
    if (!validPayment.includes(data.paymentStatus)) {
      addError(errors, "paymentStatus", `paymentStatus must be one of: ${validPayment.join(", ")}`);
    } else {
      result.paymentStatus = data.paymentStatus;
    }
  }

  if (Object.keys(result).length === 0) {
    addError(errors, "body", "At least one of pickupStatus or paymentStatus is required");
  }

  return { success: errors.length === 0, data: result, errors };
};

// Admin update pickup
export const validateAdminUpdatePickup = (data) => {
  const errors = [];
  const result = {};
  const valid = ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"];

  if (isEmpty(data.pickupStatus)) {
    addError(errors, "pickupStatus", "pickupStatus is required");
  } else if (!valid.includes(data.pickupStatus)) {
    addError(errors, "pickupStatus", `pickupStatus must be one of: ${valid.join(", ")}`);
  } else {
    result.pickupStatus = data.pickupStatus;
  }

  if (!isEmpty(data.reason)) {
    if (data.reason.length > 500) {
      addError(errors, "reason", "Reason cannot exceed 500 characters");
    } else {
      result.reason = trimString(data.reason);
    }
  }

  return { success: errors.length === 0, data: result, errors };
};

// Admin reverse pickup
export const validateAdminReversePickup = (data) => {
  const errors = [];
  const result = {};

  if (!isEmpty(data.reason)) {
    if (data.reason.length > 500) {
      addError(errors, "reason", "Reason cannot exceed 500 characters");
    } else {
      result.reason = trimString(data.reason);
    }
  }

  return { success: errors.length === 0, data: result, errors };
};

// ============= ADMIN CONFIG VALIDATORS (missing) =============

// Update config variable
export const validateConfigVariable = (data) => {
  const errors = [];
  const result = {};

  if (isEmpty(data.key)) {
    addError(errors, "key", "Config key is required");
  } else {
    result.key = trimString(data.key);
  }

  if (data.value === undefined || data.value === null) {
    addError(errors, "value", "Config value is required");
  } else {
    result.value = data.value;
  }

  return { success: errors.length === 0, data: result, errors };
};

// Toggle feature flag
export const validateToggleFeature = (data) => {
  const errors = [];
  const result = {};

  if (isEmpty(data.feature)) {
    addError(errors, "feature", "Feature name is required");
  } else {
    result.feature = trimString(data.feature);
  }

  if (data.enabled === undefined) {
    addError(errors, "enabled", "enabled (boolean) is required");
  } else {
    result.enabled = data.enabled === true;
  }

  return { success: errors.length === 0, data: result, errors };
};

// Admin verify/update store active status
export const validateVerifyStore = (data) => {
  const errors = [];
  const result = {};

  if (data.active === undefined) {
    addError(errors, "active", "active (boolean) is required");
  } else {
    result.active = data.active === true;
  }

  return { success: errors.length === 0, data: result, errors };
};

// Mark notification as read (single)
export const validateMarkAsRead = (data) => {
  const errors = [];
  const result = {};

  if (isEmpty(data.notificationId)) {
    addError(errors, "notificationId", "notificationId is required");
  } else if (typeof data.notificationId !== "string") {
    addError(errors, "notificationId", "notificationId must be a string");
  } else {
    result.notificationId = data.notificationId;
  }

  return { success: errors.length === 0, data: result, errors };
};

// ============= SCHEDULE REMINDER VALIDATORS =============

export const validateScheduleReminders = (data) => {
  const errors = [];
  const result = {};

  const validDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const validPrompts = [
    "remind_post_product",
    "remind_pending_orders",
    "remind_recent_notifications",
    "remind_daily_stats",
    "remind_low_stock",
  ];

  // enabled
  result.enabled = data.enabled === true;

  // days
  if (!Array.isArray(data.days) || data.days.length === 0) {
    addError(errors, "days", "At least one day is required");
  } else {
    const invalidDays = data.days.filter((d) => !validDays.includes(d));
    if (invalidDays.length) {
      addError(errors, "days", `Invalid days: ${invalidDays.join(", ")}`);
    } else {
      result.days = data.days;
    }
  }

  // times (hours array, max 3, integers 0-23)
  if (!Array.isArray(data.times) || data.times.length === 0) {
    addError(errors, "times", "At least one reminder time (hour) is required");
  } else if (data.times.length > 3) {
    addError(errors, "times", "Maximum 3 reminder times allowed per day");
  } else {
    const parsed = data.times.map(Number);
    const invalid = parsed.filter((h) => !Number.isInteger(h) || h < 0 || h > 23);
    if (invalid.length) {
      addError(errors, "times", "Each time must be a valid hour between 0 and 23");
    } else {
      result.times = parsed;
    }
  }

  // promptType
  if (isEmpty(data.promptType)) {
    addError(errors, "promptType", "Prompt type is required");
  } else if (!validPrompts.includes(data.promptType)) {
    addError(errors, "promptType", `Invalid prompt type. Choose one of: ${validPrompts.join(", ")}`);
  } else {
    result.promptType = data.promptType;
  }

  return { success: errors.length === 0, data: result, errors };
};
