import React, { useContext, useState } from 'react';
import { Link } from "react-router-dom";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import CoverLayout from "layouts/authentication/components/CoverLayout";
import bgImage from "assets/images/bg-sign-up-cover.jpeg";
import AuthService from "services/auth-service";
import { AuthContext } from "context";
import { InputLabel } from "@mui/material";

function Register() {
  const authContext = useContext(AuthContext);

  const [inputs, setInputs] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const [errors, setErrors] = useState({
    nameError: false,
    emailError: false,
    passwordError: false,
    confirmPasswordError: false,
    agreeError: false,
    error: false,
    errorText: "",
  });

  const [suggestedname, setSuggestedname] = useState("");

  const changeHandler = async (e) => {
    const { name, value } = e.target;
    setInputs({
      ...inputs,
      [name]: value,
    });

    if (name === 'name') {
      checknameAvailability(value);
    }
  };

  const checknameAvailability = async (name) => {
    try {
      const isAvailable = await AuthService.checkname(name);
      if (!isAvailable) {
        const newname = `${name}${Math.floor(Math.random() * 1000)}`;
        setSuggestedname(newname);
        setErrors({ ...errors, nameError: true });
      } else {
        setSuggestedname("");
        setErrors({ ...errors, nameError: false });
      }
    } catch (error) {
      console.error("Error checking name availability", error);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if (inputs.name.trim().length === 0) {
      setErrors({ ...errors, nameError: true });
      return;
    }

    if (inputs.email.trim().length === 0 || !inputs.email.trim().match(mailFormat)) {
      setErrors({ ...errors, emailError: true });
      return;
    }

    if (inputs.password.trim().length < 8) {
      setErrors({ ...errors, passwordError: true });
      return;
    }

    if (inputs.password !== inputs.confirmPassword) {
      setErrors({ ...errors, confirmPasswordError: true });
      return;
    }

    if (inputs.agree === false) {
      setErrors({ ...errors, agreeError: true });
      return;
    }

    const newUser = { name: inputs.name, email: inputs.email, password: inputs.password };

    const myData = {
      data: {
        type: "users",
        attributes: { ...newUser, password_confirmation: newUser.password },
        relationships: {
          roles: {
            data: [
              {
                type: "roles",
                id: "1",
              },
            ],
          },
        },
      },
    };

    try {
      const response = await AuthService.register(myData);
      authContext.login(response.access_token, response.refresh_token);

      setInputs({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        agree: false,
      });

      setErrors({
        nameError: false,
        emailError: false,
        passwordError: false,
        confirmPasswordError: false,
        agreeError: false,
        error: false,
        errorText: "",
      });
    } catch (err) {
      setErrors({ ...errors, error: true, errorText: err.message });
      console.error(err);
    }
  };

  return (
    <CoverLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Cv Freelancer
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Insira seu nome, email, e password para criar sua conta
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" method="POST" onSubmit={submitHandler}>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Username"
                variant="standard"
                fullWidth
                name="name"
                value={inputs.name}
                onChange={changeHandler}
                error={errors.nameError}
                inputProps={{
                  autoComplete: "name",
                  form: {
                    autoComplete: "off",
                  },
                }}
              />
              {errors.nameError && (
                <MDTypography variant="caption" color="error" fontWeight="light">
                  O nome de usuário já existe. Sugestão: {suggestedname}
                </MDTypography>
              )}
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Email"
                variant="standard"
                fullWidth
                value={inputs.email}
                name="email"
                onChange={changeHandler}
                error={errors.emailError}
                inputProps={{
                  autoComplete: "email",
                  form: {
                    autoComplete: "off",
                  },
                }}
              />
              {errors.emailError && (
                <MDTypography variant="caption" color="error" fontWeight="light">
                  Email Inválido
                </MDTypography>
              )}
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Password"
                variant="standard"
                fullWidth
                name="password"
                value={inputs.password}
                onChange={changeHandler}
                error={errors.passwordError}
              />
              {errors.passwordError && (
                <MDTypography variant="caption" color="error" fontWeight="light">
                  A password precisa ter 8 caracteres
                </MDTypography>
              )}
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Confirmar Password"
                variant="standard"
                fullWidth
                name="confirmPassword"
                value={inputs.confirmPassword}
                onChange={changeHandler}
                error={errors.confirmPasswordError}
              />
              {errors.confirmPasswordError && (
                <MDTypography variant="caption" color="error" fontWeight="light">
                  As passwords não coincidem
                </MDTypography>
              )}
            </MDBox>
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Checkbox name="agree" id="agree" onChange={changeHandler} />
              <InputLabel
                variant="standard"
                fontWeight="regular"
                color="text"
                sx={{ lineHeight: "1.5", cursor: "pointer" }}
                htmlFor="agree"
              >
                &nbsp;&nbsp;Eu concordo com&nbsp;
              </InputLabel>
              <MDTypography
                component={Link}
                to="/auth/login"
                variant="button"
                fontWeight="bold"
                color="info"
                textGradient
              >
                Termos e Condições
              </MDTypography>
            </MDBox>
            {errors.agreeError && (
              <MDTypography variant="caption" color="error" fontWeight="light">
                Precisas acordar com os Termos e Condições
              </MDTypography>
            )}
            {errors.error && (
              <MDTypography variant="caption" color="error" fontWeight="light">
                {errors.errorText}
              </MDTypography>
            )}
            <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="info" fullWidth type="submit">
                Criar
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Ja tens uma conta?{" "}
                <MDTypography
                  component={Link}
                  to="/auth/login"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Entrar
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default Register;
