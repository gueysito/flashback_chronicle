import { SpotifyApi } from "@spotify/web-api-ts-sdk";

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=spotify',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);
   const refreshToken =
    connectionSettings?.settings?.oauth?.credentials?.refresh_token;
  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;
const clientId = connectionSettings?.settings?.oauth?.credentials?.client_id;
  const expiresIn = connectionSettings.settings?.oauth?.credentials?.expires_in;
  if (!connectionSettings || (!accessToken || !clientId || !refreshToken)) {
    throw new Error('Spotify not connected');
  }
  return {accessToken, clientId, refreshToken, expiresIn};
}

export async function getUncachableSpotifyClient() {
  const {accessToken, clientId, refreshToken, expiresIn} = await getAccessToken();

  const spotify = SpotifyApi.withAccessToken(clientId, {
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: expiresIn || 3600,
    refresh_token: refreshToken,
  });

  return spotify;
}

export async function searchTracks(query: string, limit: number = 10) {
  try {
    const spotify = await getUncachableSpotifyClient();
    const results = await spotify.search(query, ['track'], undefined, Math.min(limit, 50) as any);
    
    return results.tracks.items.map(track => ({
      id: track.id,
      name: track.name,
      artist: track.artists.map((a: any) => a.name).join(', '),
      albumArt: track.album.images[0]?.url || '',
      previewUrl: track.preview_url || '',
      uri: track.uri,
    }));
  } catch (error) {
    console.error('Error searching Spotify tracks:', error);
    throw error;
  }
}

export async function getCurrentlyPlaying() {
  try {
    const spotify = await getUncachableSpotifyClient();
    const nowPlaying = await spotify.player.getCurrentlyPlayingTrack();
    
    if (!nowPlaying || !nowPlaying.item || nowPlaying.item.type !== 'track') {
      return null;
    }

    const track = nowPlaying.item as any;
    return {
      id: track.id,
      name: track.name,
      artist: track.artists.map((a: any) => a.name).join(', '),
      albumArt: track.album.images[0]?.url || '',
      previewUrl: track.preview_url || '',
      uri: track.uri,
    };
  } catch (error) {
    console.error('Error getting currently playing track:', error);
    return null;
  }
}
