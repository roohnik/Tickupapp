

import { GoogleGenAI, Type } from "@google/genai";
// FIX: Corrected import path for types and added types for smart objective generation.
import { KRType, SuggestedKR, Objective, User, Task, FormSubmission, CheckIn, QuizQuestion, FormField, FormFieldType, FormFieldOption, Strategy, ObjectiveCategoryId, SuggestedPerspective, CompanyVision } from '../types';

if (!process.env.API_KEY) {
  // This is a placeholder for environments where API_KEY might not be set.
  // In a real production scenario, this key would be securely managed.
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export interface SuggestedMission {
    missionTitle: string;
    iconName: string;
    reasoning: {
        passion: string;
        skill: string;
        market: string;
        business: string;
    }
}

export interface AIPrompts {
  suggestKeyResults: string;
  analyzeOKRData: string;
  analyzeIndividualPerformance: string;
  generateMicroLearning: string;
  generateQuizForText: string;
  suggestMissions: string;
  suggestSkillsFromProfile: string;
  generateFormFromPrompt: string;
  // FIX: Added generateSmartObjectives prompt type.
  generateSmartObjectives: string;
}

export const DEFAULT_AI_PROMPTS: AIPrompts = {
  suggestKeyResults: `Based on the following objective, suggest 3-4 specific, measurable, achievable, relevant, and time-bound (SMART) Key Results.
        Objective Title: "{{objectiveTitle}}"
        Objective Description: "{{objectiveDescription}}"
        
        For each Key Result, provide a title, a type ('NUMBER', 'PERCENTAGE', or 'CURRENCY'), a startValue, and a targetValue. The startValue for new goals is typically 0.`,
  
  analyzeOKRData: `
    Analyze the following OKR data for a company.

    Data:
    {{data}}

    Provide a concise but insightful analysis in Persian, covering these points:
    1.  **Overall Performance Summary:** Give a brief overview of the company's progress towards its goals. Calculate the average completion percentage.
    2.  **Key Strengths:** Identify which objectives or teams are performing well and why. Point out positive trends.
    3.  **Areas for Improvement:** Identify objectives that are lagging or at risk. What are the potential bottlenecks or challenges based on the data?
    4.  **Actionable Recommendations:** Suggest 2-3 specific actions the leadership could take to improve performance, address challenges, or better align teams.

    Format the response clearly using Markdown with Persian headings.
  `,

  analyzeIndividualPerformance: `
    به عنوان یک مربی عملکرد حرفه‌ای، داده‌های زیر را برای کاربر "{{userName}}" در دوره عملکرد {{periodName}} تحلیل کن.

    **داده‌های عملکرد:**
    {{performanceData}}

    **درخواست تحلیل:**
    یک تحلیل کوتاه و کاربردی به زبان فارسی ارائه بده که شامل موارد زیر باشد:
    1.  **خلاصه دستاوردها:** به طور خلاصه به کارهای اصلی انجام شده اشاره کن.
    2.  **نقاط قوت:** یک نقطه قوت کلیدی کاربر بر اساس داده‌ها را مشخص کن (مثلاً، تمرکز روی اهداف، مستندسازی خوب در گزارش، یا حل چالش‌ها).
    3.  **پیشنهاد برای بهبود:** یک پیشنهاد مشخص و قابل اجرا برای بهبود عملکرد در دوره بعدی ارائه بده.

    تحلیل را دوستانه، سازنده و تشویق‌کننده بنویس. از Markdown برای قالب‌بندی استفاده کن.
  `,

  generateMicroLearning: `
        Create a concise micro-learning module in Persian on the following topic.
        The output should be in Markdown format, well-structured with headings, lists, and bold text for readability.
        The content should be practical, easy to understand, and suitable for a professional setting.
        The entire lesson should be readable in about 5 minutes.

        Topic: "{{topic}}"
    `,
    
  generateQuizForText: `Based on the following learning text in Persian, create a 3-question multiple-choice quiz to test understanding.
            For each question, provide 4 options and indicate the index of the correct answer (0-3).
            
            Learning Text:
            ---
            {{learningText}}
            ---
            `,
  
  suggestMissions: `As an expert business and career strategist specializing in the Ikigai framework, your task is to help a manager find a fulfilling and viable mission.
        Based on the provided information, suggest 3 distinct, actionable missions in Persian.

        **User's Input:**
        - **Passions (what they love):** {{passionText}}
        - **Expertise (what they're good at):** {{expertiseText}}
        - **Rated Skills (what they are skilled at):** {{skills}}
        
        **Critically, do not suggest missions that are similar to the following already suggested missions:** {{existingMissions}}

        For each mission suggestion, you must also consider and explain:
        1.  **World/Market Need:** What current global trends, market gaps, or societal needs does this mission address?
        2.  **Business Viability:** How can this mission be monetized? What is a potential business model?

        The reasoning for each point should be a single, concise sentence.
        Choose a suitable icon name for each mission from this list: [HeartIcon, BrainIcon, GlobeAltIcon, RocketIcon, LightbulbIcon, HandshakeIcon, BanknotesIcon, ChartIcon, UserGroupIcon, TrophyIcon, CubeIcon, SettingsIcon].
        `,
    suggestSkillsFromProfile: `As a career and business analyst, analyze the user's passions and expertise.
        User's Input:
        - Passions (what they love): "{{passionText}}"
        - Expertise (what they're good at): "{{expertiseText}}"

        From the following list of skills, suggest up to 24 of the MOST relevant ones.
        Available Skills with their IDs:
        {{skillsList}}

        Return ONLY a JSON object with a single key "skillIds" which is an array of the suggested skill ID strings. Do not include any other text or explanation.
        Example response: { "skillIds": ["leadership", "data-analysis", "product-management"] }
    `,
    generateFormFromPrompt: `Based on the following document content or description, create a structured list of form fields in Persian.
        The user wants to build a web form. Analyze their input and suggest appropriate fields.

        Available field types are: 'TEXT', 'TEXTAREA', 'NUMBER', 'EMAIL', 'DATE', 'SELECT', 'CHECKBOX', 'RADIO', 'RATING', 'CONFIRMATION', 'FILE_UPLOAD', 'MATRIX_SINGLE', 'SECTION', 'APPROVAL'.
        If the input suggests grouping questions, use the 'SECTION' type. For sections, the label should be the title of the section.
        For each field, you MUST provide:
        - "label": A clear, concise Persian label for the field.
        - "type": One of the available field types.
        
        You SHOULD also provide:
        - "isRequired": A boolean indicating if the field seems mandatory. Default to false.
        - "placeholder": An optional example text for the user, in Persian.
        - "options": For 'SELECT', 'RADIO', and 'CHECKBOX', provide an array of strings for the choices in Persian.
        - "icon": For 'SECTION' fields, suggest a relevant icon name from this list: [ChecklistIcon, UserIcon, DocumentTextIcon, CalendarIcon, BanknotesIcon, ExclamationTriangleIcon].

        The input from the user is:
        "{{userInput}}"
        `,
    // FIX: Added default prompt for smart objective generation.
    generateSmartObjectives: `
    As an expert OKR and business strategy coach, your task is to generate insightful strategic perspectives and corresponding SMART objectives based on user input.

    **User's Input:**
    - **High-Level Goal:** "{{goalDescription}}"
    - **Company Vision & Mission:** {{companyVision}}
    - **Priority Strategies:** {{strategies}}
    - **Rated Topics (1-5 scale):** {{topicRatings}}
    - **Strategic Dimensions (1-100 scale):**
        - Ambition (Optimization vs. Transformation): {{ambition}}
        - Focus (Internal vs. External): {{focus}}
        - Horizon (Short-term vs. Long-term): {{horizon}}
        - Certainty (Exploratory vs. Execution): {{certainty}}
    
    **Critically, do not suggest perspectives that are similar to the following already suggested ones:** {{existingPerspectives}}

    **Your Task:**
    Generate 2-3 distinct "Strategic Perspectives". A perspective is a unique angle or theme for approaching the user's goal.
    For each perspective, provide:
    1.  A "perspectiveTitle": A concise, inspiring title for the strategic angle.
    2.  A "perspectiveDescription": A one-sentence explanation of this angle.
    3.  A list of 1-2 "objectives". For each objective:
        - An "objectiveTitle": A clear, ambitious title for the Objective.
        - An "objectiveDescription": A brief description of what success looks like.
        - A list of 2-3 "keyResults". For each Key Result:
            - A "title".
            - A "type" ('NUMBER', 'PERCENTAGE', 'CURRENCY').
            - A "startValue".
            - A "targetValue".
    
    Focus on creating diverse, actionable, and insightful perspectives that directly connect to the user's inputs.
`,
};

export type GeneratedFormField = Omit<FormField, 'id' | 'options' | 'matrixRows' | 'matrixColumns'> & {
    options?: string[];
    matrixRows?: string[];
    matrixColumns?: string[];
};

export const generateFormFields = async (
    prompt: string,
    aiPromptTemplate: string,
    file?: { mimeType: string; data: string } // base64 encoded data
): Promise<GeneratedFormField[]> => {
    if (!process.env.API_KEY) {
        console.error("Gemini API key is not configured.");
        return Promise.reject("API key not available.");
    }
    try {
        const fullPrompt = aiPromptTemplate.replace('{{userInput}}', prompt);

        const parts: any[] = [];
        if (file) {
            parts.push({ inlineData: { mimeType: file.mimeType, data: file.data } });
        }
        parts.push({ text: fullPrompt });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        fields: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    label: { type: Type.STRING },
                                    type: { type: Type.STRING, enum: ['TEXT', 'TEXTAREA', 'NUMBER', 'EMAIL', 'DATE', 'SELECT', 'CHECKBOX', 'RADIO', 'RATING', 'CONFIRMATION', 'FILE_UPLOAD', 'MATRIX_SINGLE', 'SECTION', 'APPROVAL'] },
                                    isRequired: { type: Type.BOOLEAN },
                                    placeholder: { type: Type.STRING },
                                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    icon: { type: Type.STRING },
                                },
                                required: ["label", "type"]
                            }
                        }
                    }
                },
            },
        });
        
        const jsonText = response.text;
        const parsedResponse = jsonText ? JSON.parse(jsonText) : null;

        if (parsedResponse && parsedResponse.fields) {
            return parsedResponse.fields as GeneratedFormField[];
        }
        return [];

    } catch (error) {
        console.error("Error generating form fields from Gemini API:", error);
        throw new Error("Failed to generate AI form fields.");
    }
};

export const generateSmartObjectives = async (
    input: {
        goalDescription: string;
        priorityStrategyIds: string[];
        strategies: Strategy[];
        companyVision: CompanyVision;
        topicRatings: Map<ObjectiveCategoryId, number>;
        dimensions: { ambition: number; focus: number; horizon: number; certainty: number; };
        existingPerspectives: string[];
    },
    promptTemplate: string
): Promise<SuggestedPerspective[]> => {
    if (!process.env.API_KEY) {
        console.error("Gemini API key is not configured.");
        return Promise.reject("API key not available.");
    }
    try {
        const priorityStrategies = input.strategies.filter(s => input.priorityStrategyIds.includes(s.id)).map(s => s.name);
        // FIX: Removed incorrect JSON.stringify on a Map object. Object.fromEntries handles Maps correctly.
        const ratedTopics = Object.fromEntries(input.topicRatings);

        const contents = promptTemplate
            .replace('{{goalDescription}}', `"${input.goalDescription}"`)
            .replace('{{companyVision}}', JSON.stringify(input.companyVision, null, 2))
            .replace('{{strategies}}', JSON.stringify(priorityStrategies))
            .replace('{{topicRatings}}', JSON.stringify(ratedTopics))
            .replace('{{ambition}}', String(input.dimensions.ambition))
            .replace('{{focus}}', String(input.dimensions.focus))
            .replace('{{horizon}}', String(input.dimensions.horizon))
            .replace('{{certainty}}', String(input.dimensions.certainty))
            .replace('{{existingPerspectives}}', JSON.stringify(input.existingPerspectives));

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        perspectives: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    perspectiveTitle: { type: Type.STRING },
                                    perspectiveDescription: { type: Type.STRING },
                                    objectives: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                objectiveTitle: { type: Type.STRING },
                                                objectiveDescription: { type: Type.STRING },
                                                keyResults: {
                                                    type: Type.ARRAY,
                                                    items: {
                                                        type: Type.OBJECT,
                                                        properties: {
                                                            title: { type: Type.STRING },
                                                            type: { type: Type.STRING, enum: ['NUMBER', 'PERCENTAGE', 'CURRENCY'] },
                                                            startValue: { type: Type.NUMBER },
                                                            targetValue: { type: Type.NUMBER },
                                                        },
                                                        required: ["title", "type", "startValue", "targetValue"],
                                                    },
                                                },
                                            },
                                            required: ["objectiveTitle", "objectiveDescription", "keyResults"],
                                        },
                                    },
                                },
                                required: ["perspectiveTitle", "perspectiveDescription", "objectives"],
                            },
                        },
                    },
                },
            },
        });

        const jsonText = response.text;
        const parsedResponse = jsonText ? JSON.parse(jsonText) : null;

        if (parsedResponse && parsedResponse.perspectives) {
            return parsedResponse.perspectives as SuggestedPerspective[];
        }
        return [];

    } catch (error) {
        console.error("Error generating smart objectives from Gemini API:", error);
        throw new Error("Failed to generate AI smart objectives.");
    }
};


export const suggestSkillsFromProfile = async (
    passionText: string,
    expertiseText: string,
    skillsList: { id: string; label: string }[]
): Promise<string[]> => {
    if (!process.env.API_KEY) {
        console.error("Gemini API key is not configured.");
        return Promise.reject("API key not available.");
    }
    try {
        const contents = DEFAULT_AI_PROMPTS.suggestSkillsFromProfile
            .replace('{{passionText}}', `"${passionText}"`)
            .replace('{{expertiseText}}', `"${expertiseText}"`)
            .replace('{{skillsList}}', JSON.stringify(skillsList));

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        skillIds: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                        },
                    },
                },
            },
        });
        
        const jsonText = response.text;
        const parsedResponse = jsonText ? JSON.parse(jsonText) : null;
        
        if (parsedResponse && parsedResponse.skillIds) {
            return parsedResponse.skillIds;
        }
        return [];

    } catch (error) {
        console.error("Error fetching skill suggestions from Gemini API:", error);
        throw new Error("Failed to generate AI skill suggestions.");
    }
};


export const suggestMissions = async (
    passionText: string,
    expertiseText: string,
    skills: { skill: string; rating: number }[],
    existingMissions: string[] = []
): Promise<SuggestedMission[]> => {
    if (!process.env.API_KEY) {
        console.error("Gemini API key is not configured.");
        return Promise.reject("API key not available.");
    }
    try {
        const contents = DEFAULT_AI_PROMPTS.suggestMissions
            .replace('{{passionText}}', `"${passionText}"`)
            .replace('{{expertiseText}}', `"${expertiseText}"`)
            .replace('{{skills}}', JSON.stringify(skills))
            .replace('{{existingMissions}}', JSON.stringify(existingMissions));

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        missions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    missionTitle: { type: Type.STRING },
                                    iconName: { type: Type.STRING },
                                    reasoning: {
                                        type: Type.OBJECT,
                                        properties: {
                                            passion: { type: Type.STRING },
                                            skill: { type: Type.STRING },
                                            market: { type: Type.STRING },
                                            business: { type: Type.STRING },
                                        },
                                        required: ["passion", "skill", "market", "business"]
                                    },
                                },
                                required: ["missionTitle", "iconName", "reasoning"]
                            },
                        },
                    },
                },
            },
        });

        const jsonText = response.text;
        const parsedResponse = jsonText ? JSON.parse(jsonText) : null;

        if (parsedResponse && parsedResponse.missions) {
            return parsedResponse.missions;
        }
        return [];

    } catch (error) {
        console.error("Error fetching mission suggestions from Gemini API:", error);
        throw new Error("Failed to generate AI mission suggestions.");
    }
};


export const suggestKeyResults = async (
  objectiveTitle: string,
  objectiveDescription: string,
  promptTemplate: string,
): Promise<SuggestedKR[]> => {
    if (!process.env.API_KEY) {
        console.error("Gemini API key is not configured.");
        return Promise.reject("API key not available.");
    }
  try {
    const contents = promptTemplate
        .replace('{{objectiveTitle}}', `"${objectiveTitle}"`)
        .replace('{{objectiveDescription}}', `"${objectiveDescription}"`);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "The title of the Key Result.",
                  },
                  type: {
                    type: Type.STRING,
                    description: "The type of the metric (NUMBER, PERCENTAGE, CURRENCY).",
                    enum: ['NUMBER', 'PERCENTAGE', 'CURRENCY'],
                  },
                  startValue: {
                    type: Type.NUMBER,
                    description: "The starting value of the metric.",
                  },
                  targetValue: {
                    type: Type.NUMBER,
                    description: "The target value to be achieved.",
                  },
                },
                required: ["title", "type", "startValue", "targetValue"],
              },
            },
          },
        },
      },
    });

    const jsonText = response.text;
    const parsedResponse = jsonText ? JSON.parse(jsonText) : null;

    if (parsedResponse && parsedResponse.suggestions) {
      return parsedResponse.suggestions;
    }
    return [];

  } catch (error) {
    console.error("Error fetching suggestions from Gemini API:", error);
    throw new Error("Failed to generate AI suggestions.");
  }
};


export const analyzeOKRData = async (
  objectives: Objective[],
  users: User[],
  promptTemplate: string
): Promise<string> => {
  if (!process.env.API_KEY) {
      console.error("Gemini API key is not configured.");
      return Promise.reject("API key not available.");
  }

  // Remove password from users data before sending to API
  const sanitizedUsers = users.map(({ password, ...user }) => user);
  const contents = promptTemplate.replace('{{data}}', JSON.stringify({ objectives, users: sanitizedUsers }, null, 2));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
    });
    return response.text ?? '';
  } catch (error) {
    console.error("Error fetching analysis from Gemini API:", error);
    throw new Error("Failed to generate AI analysis.");
  }
};

export const analyzeIndividualPerformance = async (
  user: User,
  periodData: { tasks: Task[]; submissions: FormSubmission[]; checkIn: CheckIn | null; overdueTasksCount: number; commentsCount: number; },
  periodName: string,
  promptTemplate: string,
): Promise<string> => {
  if (!process.env.API_KEY) {
    console.error("Gemini API key is not configured.");
    return Promise.reject("API key not available.");
  }

  const sanitizedTasks = periodData.tasks.map(t => ({ content: t.content, description: t.description }));
  const checkInReport = periodData.checkIn?.report;

  let reportString = '';
  if (typeof checkInReport === 'string') {
      reportString = checkInReport;
  } else if (checkInReport) {
      reportString = `
      - کارهای انجام شده: ${checkInReport.tasksDone}
      - برنامه بعدی: ${checkInReport.tasksNext}
      - چالش‌ها: ${checkInReport.challenges}
      `;
  }
  
  const performanceData = `
    - **تعداد تسک‌های انجام شده:** ${periodData.tasks.length}
    - **لیست تسک‌های انجام شده:** ${sanitizedTasks.map(t => `"${t.content}"`).join(', ') || 'هیچکدام'}
    - **تعداد فرم‌های تکمیل شده:** ${periodData.submissions.length}
    - **تعداد تسک‌های معوقه (کل):** ${periodData.overdueTasksCount}
    - **تعداد کامنت‌های ثبت شده:** ${periodData.commentsCount}
    - **گزارش پیشرفت OKR (چک-این):**
      ${reportString || 'گزارشی ثبت نشده است.'}
  `;

  const contents = promptTemplate
    .replace('{{userName}}', user.name)
    .replace('{{periodName}}', periodName)
    .replace('{{performanceData}}', performanceData);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
    });
    return response.text ?? '';
  } catch (error) {
    console.error("Error fetching individual analysis from Gemini API:", error);
    throw new Error("Failed to generate AI individual analysis.");
  }
};

export const generateMicroLearning = async (topic: string, promptTemplate: string): Promise<string> => {
    if (!process.env.API_KEY) {
        console.error("Gemini API key is not configured.");
        return Promise.reject("API key not available.");
    }
    
    const contents = promptTemplate.replace('{{topic}}', `"${topic}"`);

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
        });
        return response.text ?? '';
    } catch (error) {
        console.error("Error generating micro-learning from Gemini API:", error);
        throw new Error("Failed to generate AI micro-learning.");
    }
};

export const generateQuizForText = async (learningText: string, promptTemplate: string): Promise<QuizQuestion[]> => {
    if (!process.env.API_KEY) {
        console.error("Gemini API key is not configured.");
        return Promise.reject("API key not available.");
    }
    
    const contents = promptTemplate.replace('{{learningText}}', learningText);

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        quiz: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    questionText: {
                                        type: Type.STRING,
                                        description: "The text of the quiz question.",
                                    },
                                    options: {
                                        type: Type.ARRAY,
                                        items: { type: Type.STRING },
                                        description: "An array of 4 possible answers.",
                                    },
                                    correctAnswerIndex: {
                                        type: Type.NUMBER,
                                        description: "The 0-based index of the correct answer in the options array.",
                                    },
                                },
                                required: ["questionText", "options", "correctAnswerIndex"],
                            },
                        },
                    },
                },
            },
        });

        const jsonText = response.text;
        const parsedResponse = jsonText ? JSON.parse(jsonText) : null;

        if (parsedResponse && parsedResponse.quiz) {
            return parsedResponse.quiz as QuizQuestion[];
        }
        return [];

    } catch (error) {
        console.error("Error generating quiz from Gemini API:", error);
        throw new Error("Failed to generate AI quiz.");
    }
};