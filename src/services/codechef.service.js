export async function getCodeChefData(handle) {
  try {
    const res = await fetch(
      `https://competeapi.vercel.app/user/codechef/${handle}/`
    );
    const data = await res.json();

    if (!data || !data.username) {
      return { success: false, error: 'User not found' };
    }

    return {
      success: true,
      data: {
        handle: data.username ?? handle,
        currentRating: data.rating_number ?? 0,
        highestRating: data.max_rank ?? data.rating_number ?? 0,
        stars: data.rating ?? '1★',
      }
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}