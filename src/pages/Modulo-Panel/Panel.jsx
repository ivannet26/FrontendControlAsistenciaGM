import "./Panel.css";

function Panel() {

    return (

        <div className="panel-page">


            <div className="panel-header">

                <h1>
                    Panel
                </h1>


                <div className="panel-actions">

                    <button>
                        Solo yo ▾
                    </button>


                    <button>
                        📅 Esta semana
                    </button>


                    <button>
                        ‹
                    </button>


                    <button>
                        ›
                    </button>


                </div>


            </div>





            <div className="panel-main">


                <div className="panel-summary-area">


                    <div className="summary-container">


                        <div className="summary-item">

                            <span>
                                Tiempo total
                            </span>

                            <strong>
                                00:00:00
                            </strong>

                        </div>



                        <div className="summary-item">

                            <span>
                                Proyecto principal
                            </span>

                            <strong>
                                --
                            </strong>

                        </div>



                        <div className="summary-item">

                            <span>
                                Principal Cliente
                            </span>

                            <strong>
                                --
                            </strong>

                        </div>


                    </div>




                    <div className="activity-box">


                        <span>
                            Actividades más registradas
                        </span>


                        <strong>
                            Top 10 ▾
                        </strong>


                    </div>


                </div>






                <div className="chart-box">


                    <div className="chart-empty">


                        <div className="chart-icon">
                            📊
                        </div>


                        <h3>
                            No hay datos para mostrar
                        </h3>


                        <p>
                            Intentar ajustar los filtros para obtener algunos resultados.
                        </p>


                    </div>



                </div>



            </div>



        </div>

    );

}


export default Panel;