const _0x44ac96 = _0x5f3e;

(function (_0x3c549d, _0x20c0a1) {
    const _0x4812e2 = _0x5f3e;
    const _0x107435 = _0x3c549d();

    while (true) {
        try {
            const _0x4c2fe1 =
                parseInt(_0x4812e2(0x1e0)) / 1 * (parseInt(_0x4812e2(0x1c2)) / 2) +
                -parseInt(_0x4812e2(0x1d2)) / 3 +
                -parseInt(_0x4812e2(0x1da)) / 4 +
                -parseInt(_0x4812e2(0x1a2)) / 5 +
                parseInt(_0x4812e2(0x1ba)) / 6 * (-parseInt(_0x4812e2(0x19b)) / 7) +
                parseInt(_0x4812e2(0x19a)) / 8 * (-parseInt(_0x4812e2(0x1e2)) / 9) +
                parseInt(_0x4812e2(0x1e4)) / 10;

            if (_0x4c2fe1 === _0x20c0a1) break;
            else _0x107435.push(_0x107435.shift());
        } catch (_0x392fb3) {
            _0x107435.push(_0x107435.shift());
        }
    }
}(_0x6d8f, 0xf01a6));

async function hackMUITextarea(parentElement, valueToSet) {
    const _0x4ce465 = _0x5f3e;
    const inputElement = parentElement.querySelector(_0x4ce465(0x1df));

    if (!inputElement) return false;

    try {
        const reactKeys = Object.keys(inputElement).filter(
            key =>
                key.startsWith(_0x4ce465(0x1e9)) ||
                key.includes(_0x4ce465(0x1c5)) ||
                key.includes(_0x4ce465(0x1dd))
        );

        if (reactKeys.length > 0) {
            for (const key of reactKeys) {
                const handler = inputElement[key];

                if (handler && typeof handler.onChange === 'function') {
                    console.log('[DEBUG] Manipulador onChange encontrado em:', key);

                    const fakeEvent = {
                        target: { value: valueToSet },
                        currentTarget: { value: valueToSet },
                        preventDefault: () => {},
                        stopPropagation: () => {}
                    };

                    handler.onChange(fakeEvent);

                    setTimeout(() => {
                        if (inputElement.value === valueToSet) {
                            console.log('[SUCCESS] Texto inserido com sucesso!');
                        } else {
                            console.log('[ERROR] Falha ao inserir texto.');
                        }
                    }, 100);

                    return true;
                }
            }
        }
    } catch (error) {
        console.error('[ERROR] Erro ao manipular onChange:', error);
    }

    try {
        inputElement.value = '';
        inputElement.dispatchEvent(new Event('input', { bubbles: true }));

        setTimeout(() => {
            inputElement.value = valueToSet;
            inputElement.dispatchEvent(new Event('input', { bubbles: true }));
            inputElement.dispatchEvent(new Event('change', { bubbles: true }));

            console.log('[DEBUG] Valor atualizado para:', inputElement.value);
        }, 50);
    } catch (error) {
        console.error('[ERROR] Erro ao usar dispatchEvent:', error);
    }

    return setTimeout(() => {
        if (inputElement.value !== valueToSet) {
            try {
                inputElement.focus();
                inputElement.select();
                document.execCommand('insertText', false, valueToSet);

                console.log('[DEBUG] Valor após execCommand:', inputElement.value);
            } catch (error) {
                console.error('[ERROR] Erro no método execCommand:', error);
            }
        }
    }, 150);
}

async function get_ai_response(inputText) {
    const _0x4b98d5 = _0x5f3e;
    const apiKey = 'AIzaSyCmnToMeEugtd6M4I61pkYAvnWW27HMYdg'; // Chave de API fornecida
    const model = 'gemini-1.5-flash';

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: inputText }] }],
                    generationConfig: {
                        temperature: 1,
                        topP: 0.95,
                        topK: 40,
                        maxOutputTokens: 2048
                    }
                })
            }
        );

        if (!response.ok) throw new Error(`Erro na API: ${response.status}`);

        const result = await response.json();

        if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
            throw new Error('Resposta inválida da API');
        }

        return result.candidates[0].content;
    } catch (error) {
        console.error('[ERROR] Falha ao obter resposta da IA:', error);
        throw error;
    }
}

async function verificarRedacao() {
    const _0x2b754e = _0x5f3e;

    const editorElement = document.querySelector('textarea');
    if (!editorElement) {
        alert('[ERROR] Você precisa usar o script em uma redação.');
        return;
    }

    console.log('[INFO] Gerando redação com IA...');
    const aiResponse = await get_ai_response('Texto da redação aqui.');

    if (!aiResponse.includes('TITULO:') || !aiResponse.includes('TEXTO:')) {
        throw new Error('Formato de resposta da IA inválido.');
    }

    const title = aiResponse.split('TITULO:')[1].split('TEXTO:')[0].trim();
    const text = aiResponse.split('TEXTO:')[1].trim();

    console.log('[SUCCESS] Redação gerada:', { title, text });
    await hackMUITextarea(editorElement, text);
}

verificarRedacao();
