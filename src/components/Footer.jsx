import React, { useState, useEffect } from "react";
import { FiInstagram } from "react-icons/fi";

export default function Footer() {
    // Estado inicial com arrays vazios para evitar erros de renderização antes do carregamento
    const [infoSite, setInfoSite] = useState({
        eventos: [],
        contatos: [],
        funcionamento: []
    });

    useEffect(() => {
        const fetchInfoSite = async () => {
            try {
                // Acessa a variável de ambiente do Vite
                const baseUrl = import.meta.env.VITE_API_URL;
                
                // Faz a requisição GET
                const response = await fetch(`${baseUrl}/contas/admin/admin/informacao-site/`);
                
                if (!response.ok) {
                    throw new Error('Erro na requisição');
                }

                const data = await response.json();
                setInfoSite(data);
            } catch (error) {
                console.error("Erro ao carregar informações do rodapé:", error);
            }
        };

        fetchInfoSite();
    }, []);

    return (
        <footer>
            <div className="container footer-columns">
                <div className="column">
                    <FiInstagram size={30} />
                </div>
                
                {/* Coluna de Eventos */}
                <div className="column">
                    <h4>EVENTOS</h4>
                    {infoSite.eventos.length > 0 ? (
                        infoSite.eventos.map((evento) => (
                            <p key={evento.id}>{evento.nome}</p>
                        ))
                    ) : (
                        <p>Carregando...</p>
                    )}
                </div>

                {/* Coluna de Contatos */}
                <div className="column">
                    <h4>CONTATOS</h4>
                    {infoSite.contatos.map((contato, index) => (
                        <React.Fragment key={index}>
                            {/* Renderiza o email se existir */}
                            {contato.email && <p>{contato.email}</p>}
                            {/* Renderiza o telefone se existir */}
                            {contato.telefone && <p>{contato.telefone}</p>}
                        </React.Fragment>
                    ))}
                </div>

                {/* Coluna de Funcionamento */}
                <div className="column">
                    <h4>FUNCIONAMENTO</h4>
                    {infoSite.funcionamento.map((item, index) => (
                        <p key={index}>
                            {item.dia} - {item.horario}
                        </p>
                    ))}
                </div>
            </div>
        </footer>
    );
}