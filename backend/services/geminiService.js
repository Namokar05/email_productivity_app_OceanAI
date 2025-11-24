const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not set in environment variables');
        }

        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


        this.model = this.genAI.getGenerativeModel({
            model: "gemini-2.5-flash"

        });

        console.log(" Gemini API configured successfully (model: gemini-2.5-flash)");
    }

    async generateText(prompt, temperature = 0.7) {
        try {
            const result = await this.model.generateContent({
                contents: [
                    {
                        role: "user",
                        parts: [{ text: prompt }]
                    }
                ],
                generationConfig: { temperature }
            });

            return result.response.text();
        } catch (error) {
            console.error("Gemini API Error:", error.message);
            throw new Error(`Failed to generate text: ${error.message}`);
        }
    }

    async categorizeEmail(email, promptTemplate) {
        try {
            const prompt = promptTemplate
                .replace("{sender}", email.sender)
                .replace("{subject}", email.subject)
                .replace("{body}", email.body);

            const category = await this.generateText(prompt);
            return category.trim();
        } catch (error) {
            console.error("Error categorizing email:", error.message);
            return "Uncategorized";
        }
    }

    async extractActionItems(email, promptTemplate) {
        try {
            const prompt = promptTemplate
                .replace("{sender}", email.sender)
                .replace("{subject}", email.subject)
                .replace("{body}", email.body);

            const response = await this.generateText(prompt);

            let clean = response.trim();
            if (clean.startsWith("```json")) clean = clean.slice(7);
            if (clean.startsWith("```")) clean = clean.slice(3);
            if (clean.endsWith("```")) clean = clean.slice(0, -3);

            const data = JSON.parse(clean.trim());
            return data.tasks || [];
        } catch (error) {
            console.error("Error extracting action items:", error.message);
            return [];
        }
    }

    async generateReply(email, promptTemplate) {
        try {
            const prompt = promptTemplate
                .replace("{sender}", email.sender)
                .replace("{subject}", email.subject)
                .replace("{body}", email.body);

            const response = await this.generateText(prompt);

            const lines = response.split("\n");
            let subject = "";
            let body = "";
            let inBody = false;

            for (const line of lines) {
                if (line.startsWith("Subject:")) {
                    subject = line.replace("Subject:", "").trim();
                } else if (line.startsWith("Body:")) {
                    inBody = true;
                } else if (inBody || (subject && line.trim())) {
                    body += line + "\n";
                }
            }

            body = body.trim();

            if (!subject && !body) {
                subject = `Re: ${email.subject}`;
                body = response;
            }

            return {
                subject: subject || `Re: ${email.subject}`,
                body: body || response
            };
        } catch (error) {
            console.error("Error generating reply:", error.message);
            return null;
        }
    }

    async summarizeEmail(email, promptTemplate) {
        try {
            const prompt = promptTemplate
                .replace("{sender}", email.sender)
                .replace("{subject}", email.subject)
                .replace("{body}", email.body);

            const summary = await this.generateText(prompt);
            return summary.trim();
        } catch (error) {
            console.error("Error summarizing email:", error.message);
            return null;
        }
    }

    async generateDraft(userRequest, context, promptTemplate) {
        try {
            const prompt = promptTemplate
                .replace("{user_request}", userRequest)
                .replace("{context}", context || "No previous context");

            const response = await this.generateText(prompt);

            const lines = response.split("\n");
            let subject = "";
            let body = "";
            let inBody = false;

            for (const line of lines) {
                if (line.startsWith("Subject:")) {
                    subject = line.replace("Subject:", "").trim();
                    inBody = true;
                } else if (inBody && line.trim()) {
                    body += line + "\n";
                }
            }

            body = body.trim();

            if (!subject && lines.length > 0) {
                subject = lines[0].replace("Subject:", "").trim();
                body = lines.slice(1).join("\n").trim();
            }

            return {
                subject: subject || "New Email",
                body: body || response
            };
        } catch (error) {
            console.error("Error generating draft:", error.message);
            return null;
        }
    }

    async chat(userMessage, context = "") {
        try {
            const prompt = `You are an intelligent email productivity assistant. Help the user with their email-related tasks.

Context:
${context}

User Message: ${userMessage}

Respond concisely:`;

            const response = await this.generateText(prompt);
            return response.trim();
        } catch (error) {
            console.error("Error in chat:", error.message);
            return "I encountered an error. Please try again.";
        }
    }
}

module.exports = new GeminiService();
