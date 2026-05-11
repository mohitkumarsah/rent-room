import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";


export const roomsRouter = router({
  generateDescription: publicProcedure
    .input(
      z.object({
        rent: z.number().positive(),
        type: z.string(),
        amenities: z.array(z.string()),
        location: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const prompt = `Generate a compelling and concise room listing description for a rental property with the following details:
- Rent: ₹${input.rent}/month
- Room Type: ${input.type}
- Amenities: ${input.amenities.join(", ")}
- Location: ${input.location}

The description should be 2-3 sentences, highlight key features, and be appealing to potential tenants. Write in a professional yet friendly tone.`;

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are a professional real estate copywriter. Generate compelling room listing descriptions that highlight key features and appeal to renters.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const description =
          response.choices[0]?.message.content || "Unable to generate description";
        return { description };
      } catch (error) {
        console.error("Error generating description:", error);
        throw new Error("Failed to generate description");
      }
    }),
});
