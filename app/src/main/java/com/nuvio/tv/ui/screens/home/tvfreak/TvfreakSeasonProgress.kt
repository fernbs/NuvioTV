package com.nuvio.tv.ui.screens.home.tvfreak

// TVFREAK: contador "3 de 10 vistos" debajo de las pestañas de temporada de la Ficha.
// Sin foco, solo texto. Cuenta igual que Nuvio (isSeasonFullyWatched): un capítulo
// está visto si está en watchedEpisodes o si su progreso está completado.

import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.tv.material3.MaterialTheme
import androidx.tv.material3.Text
import com.nuvio.tv.R
import com.nuvio.tv.domain.model.Video
import com.nuvio.tv.domain.model.WatchProgress
import com.nuvio.tv.ui.theme.NuvioTheme

@Composable
fun TvfreakSeasonProgress(
    episodes: List<Video>,
    watchedEpisodes: Set<Pair<Int, Int>>,
    episodeProgressMap: Map<Pair<Int, Int>, WatchProgress>
) {
    val numbered = remember(episodes) { episodes.distinctBy { it.id }.filter { it.season != null && it.episode != null } }
    if (numbered.isEmpty()) return
    val watched = numbered.count { video ->
        val key = video.season!! to video.episode!!
        watchedEpisodes.contains(key) || episodeProgressMap[key]?.isCompleted() == true
    }
    Text(
        text = stringResource(R.string.tvfreak_season_watched_count, watched, numbered.size),
        style = MaterialTheme.typography.bodyMedium,
        color = NuvioTheme.extendedColors.textSecondary,
        modifier = Modifier.padding(start = NuvioTheme.spacing.xxxl, end = NuvioTheme.spacing.xxxl)
    )
}
