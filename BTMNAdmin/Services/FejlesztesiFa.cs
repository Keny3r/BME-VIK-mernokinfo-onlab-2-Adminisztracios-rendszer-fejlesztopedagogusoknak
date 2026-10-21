namespace BTMNAdmin.Services;

public record FejlesztesiFa(List<TeruletNode> Teruletek);

public record TeruletNode(int Id, string Nev, List<CelNode> Celok);

public record CelNode(int Id, string Nev, List<EszkozNode> Eszkozok);

public record EszkozNode(int Id, string Nev);