export default function validate(validatorFn) {
  return (req, res, next) => {
    const error = validatorFn(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }
    next();
  };
}
