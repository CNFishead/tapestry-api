/**
 * @Desc : This function is made to handle all mongoose errors.
 *         In our try/catch blocks instead of using custom messages,
 *         We just pass this into the catch block and it will define the errors
 *         for us.
 */

export default (error: any, req: any, res: any, next?: any) => {
  // Safely extract error properties without spreading
  const err = {
    name: error.name,
    message: error.message,
    kind: error.kind,
    value: error.value,
    code: error.code,
    errors: error.errors,
    statusCode: error.statusCode,
  };

  // Mongoose Bad Object ID
  if (err.name === 'CastError') {
    const message = `No Resource Found with id: ${err.value}`;
    return res.status(404).json({ message });
  }
  if (err.kind === 'ObjectId') {
    const message = `No Resource Found with id: ${err.value}`;
    return res.status(404).json({ message });
  }
  // Mongoose Duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate field value entered Object already exists in database`;
    return res.status(400).json({ message });
  }
  // Mongoose Validation error
  if (err.message && err.message.includes('validation failed')) {
    const messages = Array.isArray(err.errors)
      ? err.errors.map((val: any) => val.message)
      : err.errors && typeof err.errors === 'object'
        ? Object.values(err.errors).map((val: any) => val.message)
        : [];

    return res.status(400).json({ message: messages.join(', ') || 'Validation Error' });
  }

  return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Server Error' });
};
