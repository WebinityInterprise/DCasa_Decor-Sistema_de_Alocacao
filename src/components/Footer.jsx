import React from "react";
import { FiInstagram } from "react-icons/fi";

export default function Footer() {
    return (
        <footer>
            <div className="container footer-columns">
                <div className="column">
                    <FiInstagram size={30} />
                </div>
                <div className="column">
                    <h4>EVENTOS</h4>
                    <p>Natal</p>
                    <p>Ano Novo</p>
                    <p>Casamento</p>
                </div>
                <div className="column">
                    <h4>CONTATOS</h4>
                    <p>contato@email.com.br</p>
                    <p>(84) 9 9999-9999</p>
                    <p>(84) 9 9999-9999</p>
                </div>
                <div className="column">
                    <h4>FUNCIONAMENTO</h4>
                    <p>Segunda - 08:00 às 17:00</p>
                    <p>Terça - 08:00 às 17:00</p>
                    <p>Quarta - 08:00 às 17:00</p>
                    <p>Quinta - 08:00 às 17:00</p>
                    <p>Sexta - 08:00 às 17:00</p>
                    <p>Sábado - 08:00 às 12:00</p>
                </div>
            </div>
        </footer>
    );
}
