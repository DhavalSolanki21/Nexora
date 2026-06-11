"""Click-based CLI for the Nexora MVP."""

from __future__ import annotations

from pathlib import Path
import pandas as pd
import click

from nexora import Nexora
from nexora.report import NexoraReport


@click.group(invoke_without_command=True)
@click.pass_context
def cli(ctx: click.Context) -> None:
    """Nexora predictive analytics CLI."""
    if ctx.invoked_subcommand is None:
        from nexora.cli.wizard import run_wizard
        run_wizard()

@cli.command()
def wizard() -> None:
    """Run the interactive Nexora wizard."""
    from nexora.cli.wizard import run_wizard
    run_wizard()


@cli.command()
@click.argument("data_csv", type=click.Path(exists=True, dir_okay=False, path_type=Path))
@click.option("--target", required=True, help="Target column to predict.")
@click.option("--out", "output_path", type=click.Path(dir_okay=False, path_type=Path), default=None, help="Output .nx session path.")
@click.option("--max-models", default=6, show_default=True, type=int, help="Maximum number of models to train.")
@click.option("--test-size", default=0.2, show_default=True, type=float, help="Holdout test split ratio.")
@click.option("--cv-folds", default=5, show_default=True, type=int, help="Requested cross-validation folds.")
@click.option("--timeout", "timeout_sec", default=None, type=int, help="Optional per-model timeout in seconds.")
@click.option("--seed", "random_state", default=42, show_default=True, type=int, help="Random seed.")
@click.option("--early-stopping/--no-early-stopping", default=True, show_default=True, help="Enable early stopping when supported.")
def train(
    data_csv: Path,
    target: str,
    output_path: Path | None,
    max_models: int,
    test_size: float,
    cv_folds: int,
    timeout_sec: int | None,
    random_state: int,
    early_stopping: bool,
) -> None:
    """Train models from a CSV and save a Nexora session."""
    report = Nexora(data_csv, target=target).run(
        max_models=max_models,
        test_size=test_size,
        cv_folds=cv_folds,
        timeout_sec=timeout_sec,
        random_state=random_state,
        early_stopping=early_stopping,
    )
    session_path = output_path or data_csv.with_suffix(".nx")
    saved = report.save(session_path)
    click.echo(f"Best model: {report.best_model} ({report.best_score_label}={report.best_score:.4f})")
    click.echo(f"Saved session: {saved}")
    click.echo(report.leaderboard.head(10).to_string(index=False))


@cli.command()
@click.argument("data_csv", type=click.Path(exists=True, dir_okay=False, path_type=Path))
@click.option("--export", type=click.Path(dir_okay=False, path_type=Path), default=None, help="Export profile HTML.")
def profile(data_csv: Path, export: Path | None) -> None:
    """Dataset health report in terminal."""
    prof = Nexora(data_csv).profile()
    click.echo(f"Dataset Profile: {prof.source_name}")
    click.echo(f"Health Score: {prof.health_score}/100")
    click.echo(f"Shape: {prof.num_rows} rows x {prof.num_columns} cols")
    click.echo(f"Missing Cells: {prof.missing_cells}")
    if export:
        export.write_text("<h1>Profile Placeholder</h1>", encoding="utf-8")
        click.echo(f"Exported to {export}")


@cli.command()
@click.argument("data_csv", type=click.Path(exists=True, dir_okay=False, path_type=Path))
@click.option("--target", required=True, help="Target column to predict.")
def quick(data_csv: Path, target: str) -> None:
    """30-second fast mode from terminal."""
    report = Nexora(data_csv, target=target).quick()
    click.echo(f"Best: {report.best_model} | Score: {report.best_score:.4f}")
    click.echo(report.leaderboard.to_string(index=False))


@cli.command()
@click.argument("model_nx", type=click.Path(exists=True, dir_okay=False, path_type=Path))
@click.argument("new_data", type=click.Path(exists=True, dir_okay=False, path_type=Path))
@click.option("--output", type=click.Path(dir_okay=False, path_type=Path), default=Path("predictions.csv"))
def predict(model_nx: Path, new_data: Path, output: Path) -> None:
    """Batch predictions from CLI."""
    report = Nexora.load(model_nx)
    df = pd.read_csv(new_data)
    preds = report.predict(df)
    preds.to_csv(output, index=False)
    click.echo(f"Saved {len(preds)} predictions to {output}")


@cli.command()
@click.argument("model_nx", type=click.Path(exists=True, dir_okay=False, path_type=Path))
@click.option("--port", default=8000, type=int)
@click.option("--host", default="0.0.0.0", type=str)
def serve(model_nx: Path, port: int, host: str) -> None:
    """Start prediction API from CLI."""
    report = Nexora.load(model_nx)
    report.serve(port=port)


@cli.command()
@click.argument("model_nx", type=click.Path(exists=True, dir_okay=False, path_type=Path))
@click.option("--type", "gen_type", type=click.Choice(["fastapi", "flask", "streamlit", "docker", "notebook"]), required=True)
@click.option("--out", type=click.Path(path_type=Path), default=Path("./deploy/"))
def codegen(model_nx: Path, gen_type: str, out: Path) -> None:
    """Generate deployment code from CLI."""
    report = Nexora.load(model_nx)
    if gen_type == "fastapi":
        report.save_fastapi(out / "api.py")
    elif gen_type == "flask":
        report.save_flask(out / "app.py")
    elif gen_type == "streamlit":
        report.save_streamlit(out / "dashboard.py")
    elif gen_type == "docker":
        report.save_docker(out / "Dockerfile", out / "requirements.txt")
    elif gen_type == "notebook":
        report.save_notebook(out / "explore.ipynb")
    click.echo(f"Generated {gen_type} code in {out}")


@cli.command(name="report")
@click.argument("model_nx", type=click.Path(exists=True, dir_okay=False, path_type=Path))
@click.option("--format", "fmt", type=click.Choice(["html", "pdf"]), required=True)
@click.option("--out", type=click.Path(path_type=Path), default=Path("report.html"))
def generate_report(model_nx: Path, fmt: str, out: Path) -> None:
    """Generate full HTML/PDF report from saved session."""
    report = Nexora.load(model_nx)
    if fmt == "html":
        report.to_html(out)
    else:
        report.to_pdf(out)


@cli.command()
@click.argument("model_nx", type=click.Path(exists=True, dir_okay=False, path_type=Path))
@click.argument("new_data", type=click.Path(exists=True, dir_okay=False, path_type=Path))
@click.option("--threshold", type=float, default=0.1)
def drift(model_nx: Path, new_data: Path, threshold: float) -> None:
    """Run drift check from CLI."""
    report = Nexora.load(model_nx)
    df = pd.read_csv(new_data)
    drift_res = report.drift(df, threshold=threshold)
    click.echo("Drift Analysis Results:")
    click.echo(str(drift_res))


@cli.command()
@click.argument("r1", type=click.Path(exists=True, dir_okay=False, path_type=Path))
@click.argument("r2", type=click.Path(exists=True, dir_okay=False, path_type=Path))
def compare(r1: Path, r2: Path) -> None:
    """Compare two sessions in terminal."""
    report1 = Nexora.load(r1)
    report2 = Nexora.load(r2)
    Nexora.compare_runs(report1, report2)


@cli.command()
@click.argument("data_csv", type=click.Path(exists=True, dir_okay=False, path_type=Path))
@click.option("--target", required=True)
@click.option("--out", type=click.Path(dir_okay=False, path_type=Path), default=Path("clean_data.csv"))
def clean(data_csv: Path, target: str, out: Path) -> None:
    """Preprocess only — output cleaned CSV without training."""
    nx = Nexora(data_csv, target=target)
    nx.preprocess(save=str(out))
    click.echo(f"Cleaned data saved to {out}")


@cli.command()
@click.option("--category", default=None)
@click.option("--task", default=None)
def models(category: str | None, task: str | None) -> None:
    """List all available models."""
    from nexora.models.registry import get_models_for_task
    
    all_models = []
    if task == "classification" or not task:
        all_models.extend(get_models_for_task("classification"))
    if task == "regression" or not task:
        all_models.extend(get_models_for_task("regression"))
        
    click.echo(f"Available models in Nexora ({len(all_models)}):")
    for spec in all_models:
        if category and spec.family != category:
            continue
        click.echo(f"- {spec.model_name} [{spec.family}] ({spec.task_type})")


@cli.command()
@click.option("--set", "set_val", nargs=2, type=str, help="Set a config key value (e.g. llm_provider ollama)")
@click.option("--show", is_flag=True, help="Show all config")
def config(set_val: tuple[str, str] | None, show: bool) -> None:
    """Global configuration."""
    if set_val:
        click.echo(f"Config set: {set_val[0]} = {set_val[1]}")
    if show:
        click.echo("Current configuration: Default (mock)")
