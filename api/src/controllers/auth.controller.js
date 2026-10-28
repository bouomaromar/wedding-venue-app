const authService = require("../services/auth.service");
const { ROLES } = require("../config/constants");

// Controllers only translate HTTP <-> service calls. Validation already ran in
// the route, and any thrown error goes to the error middleware.

const register = async (req, res) => {
    const { name, email, phone, password, role, companyName } = req.body;

    const result = await authService.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        password,
        role: role || ROLES.COUPLE,
        companyName: companyName?.trim() || null
    });

    res.status(201).json(result);
};

const login = async (req, res) => {
    const result = await authService.login({
        email: req.body.email.trim().toLowerCase(),
        password: req.body.password
    });

    res.status(200).json(result);
};

const refresh = async (req, res) => {
    const tokens = await authService.refresh({ refreshToken: req.body.refreshToken });
    res.status(200).json(tokens);
};

const logout = async (req, res) => {
    await authService.logout({ refreshToken: req.body.refreshToken });
    res.status(204).send();
};

const me = async (req, res) => {
    const user = await authService.getCurrentUser(req.user.id);
    res.status(200).json(user);
};

module.exports = {
    register,
    login,
    refresh,
    logout,
    me
};
