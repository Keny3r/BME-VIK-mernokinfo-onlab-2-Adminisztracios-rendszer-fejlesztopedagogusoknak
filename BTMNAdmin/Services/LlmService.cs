using System.Net.Http.Json;
using System.Text.Json.Serialization;

namespace BTMNAdmin.Services;

public record FejlesztesiTeruletDto(int Id, string Nev);

public class ExtractApiRequest
{
    public string Text { get; set; } = string.Empty;
}

public class LlmExtractResultDto
{
    public string? Nev { get; set; }
    public string? AnyjaNeve { get; set; }
    public string? SzuletesiHelyEsIdo { get; set; }
    public string? SzuletesiHelye { get; set; }
    public string? SzuletesiIdeje { get; set; }
    public string? Iktatoszam { get; set; }
    public string? ForgalmiSzam { get; set; }
    public string? HetiOraszam { get; set; }
    public string? FelulvizsgalatIdeje { get; set; }
    public string? FejlesztesFormaja { get; set; }
    public string? PedagogiaiSzakszolgalat { get; set; }
    public List<int> FejlesztesiTeruletek { get; set; } = new();
}

internal class FastAPIExtractRequest
{
    [JsonPropertyName("text")]
    public string Text { get; set; } = string.Empty;

    [JsonPropertyName("fejlesztesi_teruletek")]
    public List<FastAPIFejlesztesiTeruletItem> FejlesztesiTeruletek { get; set; } = new();
}

internal class FastAPIFejlesztesiTeruletItem
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("nev")]
    public string Nev { get; set; } = string.Empty;
}

internal class FastAPIExtractResponse
{
    [JsonPropertyName("pedagogiai_szakszolgalat")]
    public string? PedagogiaiSzakszolgalat { get; set; }

    [JsonPropertyName("gyermek_neve")]
    public string? GyermekNeve { get; set; }

    [JsonPropertyName("anyja_neve")]
    public string? AnyjaNeve { get; set; }

    [JsonPropertyName("szuletesi_helye")]
    public string? SzuletesiHelye { get; set; }

    [JsonPropertyName("szuletesi_ideje")]
    public string? SzuletesiIdeje { get; set; }

    [JsonPropertyName("iktato_szam")]
    public string? IktatoSzam { get; set; }

    [JsonPropertyName("forgalmi_szam")]
    public string? ForgalmiSzam { get; set; }

    [JsonPropertyName("heti_oraszam")]
    public string? HetiOraszam { get; set; }

    [JsonPropertyName("felulvizsgalat_ideje")]
    public string? FelulvizsgalatIdeje { get; set; }

    [JsonPropertyName("fejlesztes_formaja")]
    public string? FejlesztesFormaja { get; set; }

    [JsonPropertyName("fejlesztesi_teruletek")]
    public List<int> FejlesztesiTeruletek { get; set; } = new();
}

public class LlmService(HttpClient httpClient, ILogger<LlmService> logger)
{
    public async Task<LlmExtractResultDto?> ExtractAsync(
        string text,
        IEnumerable<FejlesztesiTeruletDto> teruletek,
        CancellationToken cancellationToken = default)
    {
        var pyRequest = new FastAPIExtractRequest
        {
            Text = text,
            FejlesztesiTeruletek = teruletek
                .Select(t => new FastAPIFejlesztesiTeruletItem { Id = t.Id, Nev = t.Nev })
                .ToList()
        };

        try
        {
            using var response = await httpClient.PostAsJsonAsync("/extract", pyRequest, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("Az LLM mikroszerviz hibakóddal válaszolt: {StatusCode}", response.StatusCode);
                return null;
            }

            var raw = await response.Content.ReadFromJsonAsync<FastAPIExtractResponse>(cancellationToken: cancellationToken);
            if (raw is null)
            {
                return null;
            }

            var szuletesiHelyEsIdo = FormatSzuletesiHelyEsIdo(raw.SzuletesiHelye, raw.SzuletesiIdeje);

            return new LlmExtractResultDto
            {
                Nev = raw.GyermekNeve,
                AnyjaNeve = raw.AnyjaNeve,
                SzuletesiHelye = raw.SzuletesiHelye,
                SzuletesiIdeje = raw.SzuletesiIdeje,
                SzuletesiHelyEsIdo = szuletesiHelyEsIdo,
                Iktatoszam = raw.IktatoSzam,
                ForgalmiSzam = raw.ForgalmiSzam,
                HetiOraszam = raw.HetiOraszam,
                FelulvizsgalatIdeje = raw.FelulvizsgalatIdeje,
                FejlesztesFormaja = raw.FejlesztesFormaja,
                PedagogiaiSzakszolgalat = raw.PedagogiaiSzakszolgalat,
                FejlesztesiTeruletek = raw.FejlesztesiTeruletek ?? new List<int>()
            };
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or OperationCanceledException)
        {
            logger.LogWarning(ex, "Nem sikerült elérni az LLM mikroszervizt vagy időtúllépés történt.");
            return null;
        }
    }

    private static string? FormatSzuletesiHelyEsIdo(string? hely, string? ido)
    {
        hely = string.IsNullOrWhiteSpace(hely) ? null : hely.Trim();
        ido = string.IsNullOrWhiteSpace(ido) ? null : ido.Trim();

        if (hely is not null && ido is not null)
            return $"{hely}, {ido}";
        return hely ?? ido;
    }
}
