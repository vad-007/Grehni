
import { GoogleGenAI, Type } from '@google/genai';
import { CATEGORY_KEYS } from '../constants';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Using a mock response.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

interface CategorizedTransaction {
  originalDescription: string;
  category: string;
}

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      originalDescription: {
        type: Type.STRING,
        description: 'The original transaction description provided in the input.',
      },
      category: {
        type: Type.STRING,
        description: `The most appropriate category for the transaction. Must be one of the following: ${CATEGORY_KEYS.join(', ')}.`,
        enum: CATEGORY_KEYS,
      },
    },
    required: ['originalDescription', 'category'],
  },
};

export const categorizeTransactions = async (descriptions: string[]): Promise<CategorizedTransaction[]> => {
  if (!process.env.API_KEY) {
    // Mock response for environments without an API key
    return new Promise(resolve => {
        setTimeout(() => {
            const mockCategorization = descriptions.map(desc => {
                let category = 'Miscellaneous';
                if (desc.includes('TRADER JOES') || desc.includes('WALMART')) category = 'Groceries';
                if (desc.includes('SHELL OIL')) category = 'Transportation';
                if (desc.includes('NETFLIX') || desc.includes('AMC')) category = 'Entertainment';
                if (desc.includes('STARBUCKS') || desc.includes('BISTRO')) category = 'Dining';
                if (desc.includes('AMAZON') || desc.includes('CVS')) category = 'Shopping';
                if (desc.includes('PG&E')) category = 'Utilities';
                if (desc.includes('PAYROLL')) category = 'Income';
                if (desc.includes('UNITED AIRLINES')) category = 'Travel';
                if (desc.includes('PHARMACY')) category = 'Health';
                return { originalDescription: desc, category };
            });
            resolve(mockCategorization);
        }, 1000);
    });
  }

  try {
    const prompt = `You are an expert expense categorization engine for a personal finance app.
      Given the following list of raw transaction descriptions, categorize each one into the most appropriate category.
      
      Available categories: ${CATEGORY_KEYS.join(', ')}.
      
      Return the result as a JSON array of objects, strictly adhering to the provided schema. Each object must contain the original description and its assigned category.

      Transaction Descriptions:
      ${JSON.stringify(descriptions)}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    const categorizedData: CategorizedTransaction[] = JSON.parse(jsonText);

    // Basic validation
    if (!Array.isArray(categorizedData) || categorizedData.length !== descriptions.length) {
      throw new Error('AI response is malformed or does not match input length.');
    }
    
    return categorizedData;

  } catch (error) {
    console.error('Error categorizing transactions with Gemini API:', error);
    throw new Error('Failed to get categorizations from Gemini.');
  }
};


// For Family Vault
interface AIResolution {
    [userName: string]: number;
}

const aiResolutionSchema = {
    type: Type.OBJECT,
    properties: {}, // will be dynamic
    required: [], // will be dynamic
};

export const getAIConflictResolution = async (
  totalAmount: number,
  proposals: { [userName: string]: number }
): Promise<AIResolution> => {
    
    const userNames = Object.keys(proposals);
    const dynamicSchema = { ...aiResolutionSchema };
    dynamicSchema.properties = userNames.reduce((acc, name) => {
        acc[name] = { type: Type.NUMBER, description: `The suggested allocation for ${name}.` };
        return acc;
    }, {} as any);
    dynamicSchema.required = userNames;
    
    if (!process.env.API_KEY) {
        return new Promise(resolve => {
            setTimeout(() => {
                const totalProposed = userNames.reduce((sum, name) => sum + proposals[name], 0);
                const resolved: AIResolution = {};
                let runningTotal = 0;
                userNames.forEach((name, index) => {
                    if (index === userNames.length - 1) {
                         resolved[name] = totalAmount - runningTotal;
                    } else {
                        const share = totalProposed > 0 ? (proposals[name] / totalProposed) * totalAmount : totalAmount / userNames.length;
                        resolved[name] = Math.round(share);
                        runningTotal += resolved[name];
                    }
                });
                resolve(resolved);
            }, 1000);
        });
    }

    try {
        const proposalStrings = userNames.map(name => `${name} wants $${proposals[name]}`).join(', ');

        const prompt = `You are a fair and logical family financial mediator.
            A family is trying to split their monthly budget for a specific category, which has a total of $${totalAmount}.
            Their individual proposals are: ${proposalStrings}.
            The sum of their proposals might not equal the total amount.

            Your task is to find a fair compromise that respects each person's desired amount while ensuring the sum of the new allocations equals exactly $${totalAmount}.
            Prioritize proportional allocation based on their initial proposals.
            
            Return the result as a single JSON object where keys are the names of the family members and values are their final allocated amounts.
            The sum of the values in the returned JSON object must be exactly ${totalAmount}.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: dynamicSchema,
            },
        });

        const jsonText = response.text.trim();
        // Fix: Explicitly type `resolution` to ensure type safety for subsequent operations.
        const resolution: AIResolution = JSON.parse(jsonText);
        
        // Fix: With `resolution` typed, `val` is a number, so the cast is not needed and `finalSum` is correctly inferred as a number.
        const finalSum = Object.values(resolution).reduce((sum, val) => sum + val, 0);
        // Fix: Argument to Math.round is now a number.
        if (Math.round(finalSum) !== totalAmount) {
             console.warn(`AI resolution sum is ${finalSum}, but should be ${totalAmount}. Adjusting last value.`);
             const lastName = userNames[userNames.length - 1];
             // Fix: `resolution[lastName]` is a number, so no cast is needed for the arithmetic operation.
             resolution[lastName] = resolution[lastName] + (totalAmount - finalSum);
        }

        return resolution;

    } catch (error) {
        console.error('Error getting AI conflict resolution:', error);
        throw new Error('Failed to get resolution from Gemini.');
    }
};
