import User from '../models/User.js'; // Adjust the path if needed

// Controller to fetch all users
export const getAllUsers = async (req, res) => {
  try {
    // Fetch all users and project only 'name' and 'email'
    const users = await User.find({}, 'name email');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};