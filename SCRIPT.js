// Função auxiliar para mapear strings (desofuscada para tornar mais legível)
function _0x5f3e(code) {
    const mapping = {
        0x1e0: "100",
        0x1c2: "200",
        0x1d2: "300",
        0x1da: "400",
        0x1a2: "500",
        0x1ba: "600",
        0x19b: "700",
        0x19a: "800",
        0x1e2: "900",
        0x1e4: "1000",
        0x1df: "textarea",
        0x1e9: "__react",
        0x1c5: "fiber",
        0x1dd: "handler",
    };
    return mapping[code] || code;
}

// Decodificação desnecessária foi removida
async function hackMUITextarea(parentElement, valueToSet) {
    const inputElement = parentElement.querySelector("textarea");

    if (!inputElement) return false;

    try {
        const reactKeys = Object.keys(inputElement).filter(key =>
            key.startsWith("__react") || key.includes("fiber")
        );

        if (reactKeys.length > 0) {
            for (const key of reactKeys) {
                const handler = inputElement[key];
                if (handler && typeof handler.onChange === "function") {
                    console.log("[DEBUG] Manipulador onChange encontrado em:", key);
                    const fakeEvent = {
                        target: { value: valueToSet },
                        currentTarget: { value: valueToSet },
                        preventDefault: () => {},
                        stopPropagation: () => {},
                    };
                    handler.onChange(fakeEvent);
                    setTimeout(() => {
                        if (inputElement.value === valueToSet) {
                            console.log("[SUCCESS] Texto inserido com sucesso!");
                        } else {
                            console.log("[ERROR] Falha ao inserir texto.");
                        }
                    }, 100);
                    return true;
                }
            }
        }
    } catch (error) {
        console.error("[ERROR] Erro ao manipular onChange:", error);
    }

    try {
        inputElement.value = "";
        inputElement.dispatchEvent(new Event("input", { bubbles: true }));
        setTimeout(() => {
            inputElement.value = valueToSet;
            inputElement.dispatchEvent(new Event("input", { bubbles: true }));
            inputElement.dispatchEvent(new Event("change", { bubbles: true }));
            console.log("[DEBUG] Valor atualizado para:", inputElement.value);
        }, 50);
    } catch (error) {
        console.error("[ERROR] Erro ao usar dispatchEvent:", error);
    }

    return setTimeout(() => {
        if (inputElement.value !== valueToSet) {
            try {
                inputElement.focus();
                inputElement.select();
                document.execCommand("insertText", false, valueToSet);
                console.log("[DEBUG] Valor após execCommand:", inputElement.value);
            } catch (error) {
                console.error("[ERROR] Erro no método execCommand:", error);
            }
        }
    }, 150);
}

// API de geração de texto
async function get_ai_response(inputText) {
    const apiKey = "AIzaSyCmnToMeEugtd6M4I61pkYAvnWW27HMYdg";
    const model = "gemini-1.5-flash";
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: inputText }] }],
                    generationConfig: {
                        temperature: 1,
                        topP: 0.95,
                        topK: 40,
                        maxOutputTokens: 2048,
                    },
                }),
            }
        );

        if (!response.ok) throw new Error(`Erro na API: ${response.status}`);
        const result = await response.json();
        if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
            throw new Error("Resposta inválida da API");
        }
        return result.candidates[0].content;
    } catch (error) {
        console.error("[ERROR] Falha ao obter resposta da IA:", error);
        throw error;
    }
}

// Função principal de verificação
async function verificarRedacao() {
    const editorElement = document.querySelector("textarea");
    if (!editorElement) {
        alert("[ERROR] Você precisa usar o script em uma redação.");
        return;
    }

    console.log("[INFO] Gerando redação com IA...");
    const aiResponse = await get_ai_response("Texto da redação aqui.");

    if (!aiResponse.includes("TITULO:") || !aiResponse.includes("TEXTO:")) {
        throw new Error("Formato de resposta da IA inválido.");
    }

    const title = aiResponse.split("TITULO:")[1].split("TEXTO:")[0].trim();
    const text = aiResponse.split("TEXTO:")[1].trim();

    console.log("[SUCCESS] Redação gerada:", { title, text });
    await hackMUITextarea(editorElement, text);
}

// Execução automática
verificarRedacao();
