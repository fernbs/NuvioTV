package com.nuvio.tv.ui.screens.home.tvfreak

// TVFREAK: notas pequeñas de IMDb y Rotten Tomatoes en los pósters del inicio.
// Usa los datos que Nuvio ya carga de MDBList. Si no hay notas, no dibuja nada.
// Los colores son los de marca de IMDb y Rotten Tomatoes (única excepción a "mandan los ajustes de Nuvio").

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.tv.material3.Text
import com.nuvio.tv.domain.model.MDBListRatings
import java.util.Locale
import kotlin.math.roundToInt

private val ImdbYellow = Color(0xFFF5C518)
private val TomatoRed = Color(0xFFFA320A)
private val TomatoGreen = Color(0xFF8BC53F)
private val BadgeShape = RoundedCornerShape(4.dp)
private val BadgeText = TextStyle(fontSize = 10.sp, fontWeight = FontWeight.Bold, lineHeight = 12.sp)

@Composable
fun TvfreakRatingBadges(
    ratings: MDBListRatings?,
    modifier: Modifier = Modifier
) {
    val imdb = ratings?.imdb?.takeIf { it > 0.0 }
    val tomatoes = ratings?.tomatoes?.takeIf { it > 0.0 }
    if (imdb == null && tomatoes == null) return

    Row(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        if (imdb != null) {
            Badge(
                text = String.format(Locale.US, "%.1f", imdb),
                background = ImdbYellow,
                textColor = Color.Black
            )
        }
        if (tomatoes != null) {
            Badge(
                text = "${tomatoes.roundToInt()}%",
                background = if (tomatoes >= 60.0) TomatoRed else TomatoGreen,
                textColor = Color.White
            )
        }
    }
}

@Composable
private fun Badge(text: String, background: Color, textColor: Color) {
    Box(
        modifier = Modifier
            .background(background, BadgeShape)
            .padding(horizontal = 5.dp, vertical = 2.dp)
    ) {
        Text(text = text, style = BadgeText, color = textColor, maxLines = 1)
    }
}
