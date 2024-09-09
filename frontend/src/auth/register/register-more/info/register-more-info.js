import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import CoverLayout from "layouts/authentication/components/CoverLayout";
import bgImage from "assets/images/vulcao.jpg";
import AuthService from "services/auth-service";

function MoreInfo() {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({
    nome: "",
    apelido: "",
    ilha: "",
    cidade: "",
    contacto: "",
    telefone: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const userDetails = {
      nome: inputs.nome,
      apelido: inputs.apelido,
      morada: {
        ilha: inputs.ilha,
        cidade: inputs.cidade,
        endereco: inputs.endereco,
      },
      contacto: {
        email_contact: inputs.contacto,
        phone: inputs.telefone
      }
    };

    try {
      await AuthService.updateUserDetails(userDetails);
      navigate(""); // Redireciona após preenchimento
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <CoverLayout image={bgImage}>
      <Card>
        <MDBox variant="gradient" bgColor="info" borderRadius="lg" mx={2} mt={-3} p={2} mb={1} textAlign="center">
          <MDTypography variant="h4" fontWeight="medium" color="white">Preencha seus dados adicionais</MDTypography>
        </MDBox>
        <MDBox pt={3} pb={3} px={2}>
          <MDBox component="form" onSubmit={submitHandler}>
            <MDBox mb={1.5}>
              <MDInput type="text" label="Nome" name="nome" fullWidth onChange={handleChange} />
            </MDBox>
            <MDBox mb={1.5}>
              <MDInput type="text" label="Apelido" name="apelido" fullWidth onChange={handleChange} />
            </MDBox>
            <MDBox mb={1.5}>
              <MDInput type="text" label="Ilha" name="ilha" fullWidth onChange={handleChange} />
            </MDBox>
            <MDBox mb={1.5}>
              <MDInput type="text" label="Cidade" name="cidade" fullWidth onChange={handleChange} />
            </MDBox>
            <MDBox mb={1.5}>
              <MDInput type="email" label="Email de Contacto" name="contacto" fullWidth onChange={handleChange} />
            </MDBox>
            <MDBox mb={1.5}>
              <MDInput type="number" label="Telefone" name="telefone" fullWidth onChange={handleChange} />
            </MDBox>
            <MDBox mt={3} mb={1}>
              <MDButton type="submit" variant="gradient" color="info" fullWidth>
               Continuar
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default MoreInfo;

