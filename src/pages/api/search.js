import YTMusic from "ytmusic-api"

export default async (req, res) => {
    const { search } = req.query;

    if (typeof search !== 'string' || search.length < 1) {
        return res.status(400).send('Recherche invalide');
    }

    try {
        const ytmusic = new YTMusic();
        await ytmusic.initialize();

        const safeSearch = async (searchFunction) => {
            try {
                return await searchFunction();
            } catch (error) {
                console.error(error);
                return [];
            }
        };

        const [songs, artists, albums, videos] = await Promise.all([
            safeSearch(() => ytmusic.searchSongs(search)),
            safeSearch(() => ytmusic.searchArtists(search)),
            safeSearch(() => ytmusic.searchAlbums(search)),
            safeSearch(() => ytmusic.searchVideos(search)),
        ]);
        const results = [songs, artists, albums, videos].filter(result => result !== null).flat();
        res.json(results);
    } catch (error) {
        res.status(500).send('Erreur lors de la recherche');
    }
};
