interface PredictionResult {
  predicted_digit: number;
}

export async function predictDigit(
  image: number[][]
): Promise<PredictionResult> {
  const response = await fetch(`/digit-recognition-service/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image }),
  });

  if (!response.ok) {
    let errorMessage = "Failed to predict digit";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      console.error("Error predicting digit:", e);
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
